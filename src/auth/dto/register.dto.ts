import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del ejecutivo de ventas',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'juan.perez@empresa.com',
    description: 'Email único que se usará para iniciar sesión',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'MiPassword123!',
    description: 'Mínimo 8 caracteres, al menos una mayúscula y un número',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe tener al menos una mayúscula y un número',
  })
  password: string;

  @ApiPropertyOptional({
    example: '+54 9 351 123-4567',
    description: 'Teléfono de contacto del ejecutivo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Automotores del Centro S.A.',
    description: 'Empresa o concesionaria donde trabaja el ejecutivo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;
}
