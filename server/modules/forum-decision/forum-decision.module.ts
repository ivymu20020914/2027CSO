import { Module } from '@nestjs/common';
import { ForumDecisionController } from './forum-decision.controller';
import { ForumDecisionService } from './forum-decision.service';

@Module({
  controllers: [ForumDecisionController],
  providers: [ForumDecisionService],
})
export class ForumDecisionModule {}
