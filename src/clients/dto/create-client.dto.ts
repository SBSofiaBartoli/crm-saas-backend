import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({
    example: 'Carlos Rodríguez',
    description: 'Nombre completo del cliente',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'carlos@gmail.com',
    description: 'Email de contacto del cliente',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+54 9 351 555-1234',
    description: 'Teléfono del cliente',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Empresa XYZ S.A.',
    description: 'Empresa u organización del cliente',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @ApiPropertyOptional({
    example: 'Cliente referido por Juan. Interesado en modelos SUV.',
    description: 'Notas comerciales generales sobre el cliente',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
