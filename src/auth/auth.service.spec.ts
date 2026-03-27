import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('crea un usuario y devuelve token cuando el email no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'juan@test.com',
        name: 'Juan',
        password: 'hashed',
        phone: null,
        company: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register({
        name: 'Juan',
        email: 'juan@test.com',
        password: 'Password1',
      });
      expect(result.token).toBe('mock-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('lanza ConflictException si el email ya está registrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      await expect(
        service.register({
          name: 'Juan',
          email: 'juan@test.com',
          password: 'Password1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('nunca devuelve el password en la respuesta', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'juan@test.com',
        name: 'Juan',
        password: 'hashed-password',
        phone: null,
        company: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register({
        name: 'Juan',
        email: 'juan@test.com',
        password: 'Password1',
      });
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('devuelve token con credenciales válidas', async () => {
      const hashed = await bcrypt.hash('Password1', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'juan@test.com',
        name: 'Juan',
        password: hashed,
        phone: null,
        company: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.login({
        email: 'juan@test.com',
        password: 'Password1',
      });
      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('juan@test.com');
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'noexiste@test.com', password: 'Password1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException con el mismo mensaje si la contraseña es incorrecta', async () => {
      const hashed = await bcrypt.hash('Password1', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'juan@test.com',
        password: hashed,
      });
      await expect(
        service.login({ email: 'juan@test.com', password: 'WrongPassword1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('el mensaje de error es el mismo para usuario inexistente y contraseña incorrecta', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      try {
        await service.login({ email: 'x@test.com', password: 'Password1' });
      } catch (e) {
        expect((e as UnauthorizedException).message).toBe(
          'Credenciales inválidas',
        );
      }
    });
  });
});
