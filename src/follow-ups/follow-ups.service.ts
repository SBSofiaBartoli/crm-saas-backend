import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';

@Injectable()
export class FollowUpsService {
  constructor(private prisma: PrismaService) {}

  private async verifyClientOwnership(userId: string, clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) throw new NotFoundException('Cliente no encontrado');
    if (client.userId !== userId) throw new ForbiddenException();

    return client;
  }

  async create(userId: string, clientId: string, dto: CreateFollowUpDto) {
    await this.verifyClientOwnership(userId, clientId);

    return this.prisma.followUp.create({
      data: {
        ...dto,
        clientId,
      },
    });
  }

  async findAll(userId: string, clientId: string, onlyPending?: boolean) {
    await this.verifyClientOwnership(userId, clientId);

    return this.prisma.followUp.findMany({
      where: {
        clientId,
        ...(onlyPending && { completed: false }),
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findPendingByUser(userId: string) {
    return this.prisma.followUp.findMany({
      where: {
        completed: false,
        client: {
          userId,
        },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });
  }

  async update(
    userId: string,
    clientId: string,
    followUpId: string,
    dto: UpdateFollowUpDto,
  ) {
    await this.verifyClientOwnership(userId, clientId);

    const followUp = await this.prisma.followUp.findUnique({
      where: { id: followUpId },
    });

    if (!followUp) throw new NotFoundException('Seguimiento no encontrado');
    if (followUp.clientId !== clientId) throw new ForbiddenException();

    return this.prisma.followUp.update({
      where: { id: followUpId },
      data: dto,
    });
  }

  async remove(userId: string, clientId: string, followUpId: string) {
    await this.verifyClientOwnership(userId, clientId);

    const followUp = await this.prisma.followUp.findUnique({
      where: { id: followUpId },
    });

    if (!followUp) throw new NotFoundException('Seguimiento no encontrado');
    if (followUp.clientId !== clientId) throw new ForbiddenException();

    return this.prisma.followUp.delete({
      where: { id: followUpId },
    });
  }
}
