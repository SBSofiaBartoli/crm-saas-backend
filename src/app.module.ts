import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { InteractionsModule } from './interactions/interactions.module';
import { FollowUpsModule } from './follow-ups/follow-ups.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ClientsModule,
    InteractionsModule,
    FollowUpsModule,
  ],
})
export class AppModule {}
