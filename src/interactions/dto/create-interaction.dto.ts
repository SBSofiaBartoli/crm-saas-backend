import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsIn,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateInteractionDto {
  @ApiProperty({
    example: 'call',
    description: 'Tipo de interacción',
    enum: ['call', 'meeting', 'message'],
  })
  @IsString()
  @IsIn(['call', 'meeting', 'message'], {
    message: 'El tipo debe ser call, meeting o message',
  })
  type: string;

  @ApiProperty({
    example: 'Llamada de seguimiento, cliente interesado en el modelo 2024',
    description: 'Resumen de la interacción',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  summary: string;

  @ApiProperty({
    example: '2024-03-15T10:30:00Z',
    description: 'Fecha y hora de la interacción en formato ISO 8601',
  })
  @IsDateString()
  date: string;
}
