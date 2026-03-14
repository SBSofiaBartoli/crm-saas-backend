import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'juan.perez@empresa.com',
    description: 'Email registrado',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'MiPassword123!',
    description: 'Contraseña del usuario',
  })
  @IsString()
  password: string;
}
