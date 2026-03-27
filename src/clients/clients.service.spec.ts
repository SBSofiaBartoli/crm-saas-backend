import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Client } from '@prisma/client';

const mockClient: Client = {
  id: 'client-1',
  userId: 'user-1',
  name: 'Carlos López',
  email: 'carlos@test.com',
  phone: null,
  company: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  client: {
    create: jest.fn<Promise<Client>, [unknown]>(),
    findMany: jest.fn<Promise<Client[]>, [unknown]>(),
    findUnique: jest.fn<Promise<Client | null>, [unknown]>(),
    update: jest.fn<Promise<Client>, [unknown]>(),
    delete: jest.fn<Promise<Client>, [unknown]>(),
  },
};

describe('ClientsService', () => {
  let service: ClientsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ClientsService>(ClientsService);
    jest.clearAllMocks();
  });

  describe('findAll — multi-tenant', () => {
    it('siempre filtra por userId del usuario autenticado', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);
      await service.findAll('user-1');
      expect(mockPrisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1' }) as unknown,
        }),
      );
    });

    it('aplica filtro de búsqueda cuando se pasa search', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);
      await service.findAll('user-1', 'carlos');
      expect(mockPrisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            OR: expect.any(Array) as unknown,
          }) as unknown,
        }),
      );
    });
  });

  describe('findOne — aislamiento entre usuarios', () => {
    it('devuelve el cliente si pertenece al usuario', async () => {
      mockPrisma.client.findUnique.mockResolvedValue(mockClient);
      const result = await service.findOne('user-1', 'client-1');
      expect(result.id).toBe('client-1');
    });

    it('lanza NotFoundException si el cliente no existe', async () => {
      mockPrisma.client.findUnique.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'client-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza ForbiddenException si el cliente pertenece a otro usuario', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({
        ...mockClient,
        userId: 'user-2',
      });
      await expect(service.findOne('user-1', 'client-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('crea el cliente con el userId del usuario autenticado', async () => {
      mockPrisma.client.create.mockResolvedValue(mockClient);
      await service.create('user-1', { name: 'Carlos López' });
      expect(mockPrisma.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user-1' }) as unknown,
        }),
      );
    });
  });

  describe('remove', () => {
    it('no permite eliminar un cliente de otro usuario', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({
        ...mockClient,
        userId: 'user-2',
      });
      await expect(service.remove('user-1', 'client-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.client.delete).not.toHaveBeenCalled();
    });
  });
});
