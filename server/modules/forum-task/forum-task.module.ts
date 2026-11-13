import { Module } from '@nestjs/common';
import { ForumTaskController } from './forum-task.controller';
import { ForumTaskService } from './forum-task.service';

@Module({
  controllers: [ForumTaskController],
  providers: [ForumTaskService],
})
export class ForumTaskModule {}
