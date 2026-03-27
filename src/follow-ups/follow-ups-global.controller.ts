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
import { FollowUpsService } from './follow-ups.service';

@ApiTags('Seguimientos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follow-ups')
export class FollowUpsGlobalController {
  constructor(private followUpsService: FollowUpsService) {}

  @Get('pending')
  @ApiOperation({
    summary: 'Obtener todos los seguimientos pendientes del ejecutivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de seguimientos pendientes con datos del cliente',
  })
  findAllPending(@CurrentUser() user: AuthenticatedUser) {
    return this.followUpsService.findPendingByUser(user.id);
  }
}
