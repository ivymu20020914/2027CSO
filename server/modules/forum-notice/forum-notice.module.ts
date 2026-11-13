import { Module } from '@nestjs/common';
import { ForumNoticeController } from './forum-notice.controller';
import { ForumNoticeService } from './forum-notice.service';

@Module({
  controllers: [ForumNoticeController],
  providers: [ForumNoticeService],
})
export class ForumNoticeModule {}
