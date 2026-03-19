import { ApiProperty } from '@nestjs/swagger';

export class ImportClientsDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo CSV o Excel (.xlsx) con los clientes a importar',
  })
  file: Express.Multer.File;
}
