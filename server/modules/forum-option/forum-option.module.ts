import { Module } from '@nestjs/common';
import { ForumOptionController } from './forum-option.controller';
import { ForumOptionService } from './forum-option.service';

@Module({
  controllers: [ForumOptionController],
  providers: [ForumOptionService],
})
export class ForumOptionModule {}
