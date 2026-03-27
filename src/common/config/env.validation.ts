import { plainToInstance } from 'class-transformer';
import { IsString, validateSync, IsOptional } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN: string = '7d';

  @IsOptional()
  @IsString()
  FRONTEND_URL: string = 'http://localhost:3000';
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Variables de entorno inválidas:\n${errors.toString()}`);
  }

  return validatedConfig;
}
