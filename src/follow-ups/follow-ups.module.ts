import { Module } from '@nestjs/common';
import { FollowUpsController } from './follow-ups.controller';
import { FollowUpsService } from './follow-ups.service';
import { FollowUpsGlobalController } from './follow-ups-global.controller';

@Module({
  controllers: [FollowUpsController, FollowUpsGlobalController],
  providers: [FollowUpsService],
  exports: [FollowUpsService],
})
export class FollowUpsModule {}
