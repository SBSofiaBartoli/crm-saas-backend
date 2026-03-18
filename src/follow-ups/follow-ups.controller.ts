import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user';
import { FollowUpsService } from './follow-ups.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';

@ApiTags('Seguimientos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients/:clientId/follow-ups')
export class FollowUpsController {
  constructor(private followUpsService: FollowUpsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear recordatorio de seguimiento para un cliente',
  })
  @ApiResponse({ status: 201, description: 'Seguimiento creado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('clientId') clientId: string,
    @Body() dto: CreateFollowUpDto,
  ) {
    return this.followUpsService.create(user.id, clientId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar seguimientos de un cliente' })
  @ApiQuery({
    name: 'onlyPending',
    required: false,
    type: Boolean,
    description: 'Si es true, devuelve solo los seguimientos pendientes',
  })
  @ApiResponse({ status: 200, description: 'Lista de seguimientos' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('clientId') clientId: string,
    @Query('onlyPending') onlyPending?: string,
  ) {
    return this.followUpsService.findAll(
      user.id,
      clientId,
      onlyPending === 'true',
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar seguimiento o marcarlo como completado',
  })
  @ApiResponse({ status: 200, description: 'Seguimiento actualizado' })
  @ApiResponse({ status: 404, description: 'Seguimiento no encontrado' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('clientId') clientId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFollowUpDto,
  ) {
    return this.followUpsService.update(user.id, clientId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un seguimiento' })
  @ApiResponse({ status: 204, description: 'Seguimiento eliminado' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('clientId') clientId: string,
    @Param('id') id: string,
  ) {
    return this.followUpsService.remove(user.id, clientId, id);
  }
}
