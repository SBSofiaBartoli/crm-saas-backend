import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@ApiTags('Interacciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients/:clientId/interactions')
export class InteractionsController {
  constructor(private interactionsService: InteractionsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nueva interacción con un cliente' })
  @ApiResponse({ status: 201, description: 'Interacción registrada' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('clientId') clientId: string,
    @Body() dto: CreateInteractionDto,
  ) {
    return this.interactionsService.create(user.id, clientId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener historial de interacciones de un cliente' })
  @ApiResponse({ status: 200, description: 'Lista de interacciones' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('clientId') clientId: string,
  ) {
    return this.interactionsService.findAll(user.id, clientId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una interacción' })
  @ApiResponse({ status: 204, description: 'Interacción eliminada' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('clientId') clientId: string,
    @Param('id') id: string,
  ) {
    return this.interactionsService.remove(user.id, clientId, id);
  }
}
