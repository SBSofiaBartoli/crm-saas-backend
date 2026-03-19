import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string, search?: string) {
    return this.prisma.client.findMany({
      where: {
        userId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            interactions: true,
            followUps: true,
          },
        },
      },
    });
  }

  async findOne(userId: string, clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        interactions: { orderBy: { date: 'desc' } },
        followUps: { orderBy: { dueDate: 'asc' } },
        vehicles: true,
      },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    if (client.userId !== userId) throw new ForbiddenException();
    return client;
  }

  async update(userId: string, clientId: string, dto: UpdateClientDto) {
    await this.findOne(userId, clientId);
    return this.prisma.client.update({
      where: { id: clientId },
      data: dto,
    });
  }

  async remove(userId: string, clientId: string) {
    await this.findOne(userId, clientId);
    return this.prisma.client.delete({
      where: { id: clientId },
    });
  }

  async importFromFile(userId: string, file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<{
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
      notes?: string;
    }>(sheet);

    if (rows.length === 0) {
      return { imported: 0, errors: [], message: 'El archivo está vacío' };
    }

    if (rows.length > 500) {
      throw new BadRequestException(
        'El archivo no puede tener más de 500 clientes por importación',
      );
    }

    const results = {
      imported: 0,
      errors: [] as { row: number; reason: string }[],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 porque la fila 1 es el header

      if (!row.name || String(row.name).trim() === '') {
        results.errors.push({
          row: rowNumber,
          reason: 'El campo nombre es obligatorio',
        });
        continue;
      }

      try {
        await this.prisma.client.create({
          data: {
            name: String(row.name).trim(),
            email: row.email ? String(row.email).trim() : null,
            phone: row.phone ? String(row.phone).trim() : null,
            company: row.company ? String(row.company).trim() : null,
            notes: row.notes ? String(row.notes).trim() : null,
            userId,
          },
        });
        results.imported++;
      } catch {
        results.errors.push({
          row: rowNumber,
          reason: 'Error al guardar el registro',
        });
      }
    }

    return {
      imported: results.imported,
      errors: results.errors,
      message: `Se importaron ${results.imported} clientes correctamente${results.errors.length > 0 ? ` con ${results.errors.length} errores` : ''}`,
    };
  }
}
