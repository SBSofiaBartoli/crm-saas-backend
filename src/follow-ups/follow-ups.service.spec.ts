import { Test, TestingModule } from '@nestjs/testing';
import { FollowUpsService } from './follow-ups.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrisma = {
  client: { findUnique: jest.fn() },
  followUp: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('FollowUpsService', () => {
  let service: FollowUpsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowUpsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FollowUpsService>(FollowUpsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('lanza NotFoundException si el cliente no existe', async () => {
      mockPrisma.client.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', 'client-999', {
          description: 'Llamar',
          dueDate: new Date().toISOString(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si el cliente pertenece a otro usuario', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({
        id: 'client-1',
        userId: 'user-2',
      });

      await expect(
        service.create('user-1', 'client-1', {
          description: 'Llamar',
          dueDate: new Date().toISOString(),
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update — marcar como completado', () => {
    it('actualiza el followUp correctamente', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({
        id: 'client-1',
        userId: 'user-1',
      });
      mockPrisma.followUp.findUnique.mockResolvedValue({
        id: 'fu-1',
        clientId: 'client-1',
        completed: false,
      });
      mockPrisma.followUp.update.mockResolvedValue({
        id: 'fu-1',
        completed: true,
      });

      const result = await service.update('user-1', 'client-1', 'fu-1', {
        completed: true,
      });

      expect(result.completed).toBe(true);
    });
  });
});
