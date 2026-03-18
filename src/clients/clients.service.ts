import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string, search?: string) {
    return this.prisma.client.findMany({
      where: {
        userId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            interactions: true,
            followUps: true,
          },
        },
      },
    });
  }

  async findOne(userId: string, clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        interactions: { orderBy: { date: 'desc' } },
        followUps: { orderBy: { dueDate: 'asc' } },
        vehicles: true,
      },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    if (client.userId !== userId) throw new ForbiddenException();
    return client;
  }

  async update(userId: string, clientId: string, dto: UpdateClientDto) {
    await this.findOne(userId, clientId);
    return this.prisma.client.update({
      where: { id: clientId },
      data: dto,
    });
  }

  async remove(userId: string, clientId: string) {
    await this.findOne(userId, clientId);
    return this.prisma.client.delete({
      where: { id: clientId },
    });
  }
}
