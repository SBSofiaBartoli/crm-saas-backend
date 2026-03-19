import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas y resumen del ejecutivo',
    description:
      'Retorna métricas generales, últimos clientes, próximos seguimientos e interacciones por tipo',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del dashboard',
  })
  getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getStats(user.id);
  }
}
