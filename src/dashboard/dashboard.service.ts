import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string) {
    const [
      totalClients,
      totalInteractions,
      pendingFollowUps,
      overdueFollowUps,
      recentClients,
      upcomingFollowUps,
      interactionsByType,
    ] = await Promise.all([
      // Total de clientes del ejecutivo
      this.prisma.client.count({
        where: { userId },
      }),

      // Total de interacciones registradas
      this.prisma.interaction.count({
        where: { client: { userId } },
      }),

      // Seguimientos pendientes
      this.prisma.followUp.count({
        where: {
          completed: false,
          client: { userId },
        },
      }),

      // Seguimientos vencidos (fecha pasada y sin completar)
      this.prisma.followUp.count({
        where: {
          completed: false,
          dueDate: { lt: new Date() },
          client: { userId },
        },
      }),

      // Últimos 5 clientes agregados
      this.prisma.client.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          company: true,
          phone: true,
          createdAt: true,
          _count: {
            select: {
              interactions: true,
              followUps: true,
            },
          },
        },
      }),

      // Próximos 5 seguimientos pendientes ordenados por urgencia
      this.prisma.followUp.findMany({
        where: {
          completed: false,
          client: { userId },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              company: true,
            },
          },
        },
      }),

      // Conteo de interacciones por tipo para el gráfico
      this.prisma.interaction.groupBy({
        by: ['type'],
        where: { client: { userId } },
        _count: { type: true },
      }),
    ]);

    return {
      stats: {
        totalClients,
        totalInteractions,
        pendingFollowUps,
        overdueFollowUps,
      },
      recentClients,
      upcomingFollowUps,
      interactionsByType: interactionsByType.map((item) => ({
        type: item.type,
        count: item._count.type,
      })),
    };
  }
}
