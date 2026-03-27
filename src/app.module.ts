import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { InteractionsModule } from './interactions/interactions.module';
import { FollowUpsModule } from './follow-ups/follow-ups.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './common/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    ClientsModule,
    InteractionsModule,
    FollowUpsModule,
    DashboardModule,
  ],
})
export class AppModule {}
