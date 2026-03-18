import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  private async verifyClientOwnership(userId: string, clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) throw new NotFoundException('Cliente no encontrado');
    if (client.userId !== userId) throw new ForbiddenException();

    return client;
  }

  async create(userId: string, clientId: string, dto: CreateInteractionDto) {
    await this.verifyClientOwnership(userId, clientId);

    return this.prisma.interaction.create({
      data: {
        ...dto,
        clientId,
      },
    });
  }

  async findAll(userId: string, clientId: string) {
    await this.verifyClientOwnership(userId, clientId);

    return this.prisma.interaction.findMany({
      where: { clientId },
      orderBy: { date: 'desc' },
    });
  }

  async remove(userId: string, clientId: string, interactionId: string) {
    await this.verifyClientOwnership(userId, clientId);

    const interaction = await this.prisma.interaction.findUnique({
      where: { id: interactionId },
    });

    if (!interaction) throw new NotFoundException('Interacción no encontrada');
    if (interaction.clientId !== clientId) throw new ForbiddenException();

    return this.prisma.interaction.delete({
      where: { id: interactionId },
    });
  }
}
