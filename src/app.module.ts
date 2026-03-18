import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { InteractionsModule } from './interactions/interactions.module';

@Module({
  imports: [PrismaModule, AuthModule, ClientsModule, InteractionsModule],
})
export class AppModule {}
