import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, MaxLength, MinLength } from 'class-validator';

export class CreateFollowUpDto {
  @ApiProperty({
    example: 'Llamar para confirmar visita al concesionario',
    description: 'Descripción del seguimiento a realizar',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  description: string;

  @ApiProperty({
    example: '2024-03-20T09:00:00Z',
    description:
      'Fecha límite para realizar el seguimiento en formato ISO 8601',
  })
  @IsDateString()
  dueDate: string;
}
