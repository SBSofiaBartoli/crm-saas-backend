import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateFollowUpDto {
  @ApiPropertyOptional({
    example: 'Llamar para confirmar visita al concesionario',
    description: 'Descripción actualizada del seguimiento',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: '2024-03-25T09:00:00Z',
    description: 'Nueva fecha límite',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Marcar el seguimiento como completado',
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
