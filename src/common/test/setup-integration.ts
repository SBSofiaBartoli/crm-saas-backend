import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AllExceptionsFilter } from '../filters/http-exception.filter';

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');
  await app.init();
  const prisma = app.get<PrismaService>(PrismaService);
  return { app, prisma };
}

export async function cleanDatabase(prisma: PrismaService) {
  await prisma.followUp.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
}
