import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { ForumTaskService } from './forum-task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from './forum-task.dto';
import type {
  CreateTaskResponse,
  DeleteTaskResponse,
  ForumTaskListResponse,
  UpdateTaskResponse,
  UpdateTaskStatusResponse,
} from '@shared/api.interface';

@Controller('api/forum-tasks')
export class ForumTaskController {
  constructor(private readonly forumTaskService: ForumTaskService) {}

  @Get()
  async list(): Promise<ForumTaskListResponse> {
    return this.forumTaskService.listTasks();
  }

  @NeedLogin()
  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateTaskDto,
  ): Promise<CreateTaskResponse> {
    const { userId } = req.userContext;
    return this.forumTaskService.createTask(dto, userId);
  }

  @NeedLogin()
  @Put(':taskId')
  async update(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<UpdateTaskResponse> {
    const { userId } = req.userContext;
    return this.forumTaskService.updateTask(taskId, dto, userId);
  }

  @NeedLogin()
  @Patch(':taskId/status')
  async updateStatus(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ): Promise<UpdateTaskStatusResponse> {
    const { userId } = req.userContext;
    return this.forumTaskService.updateStatus(taskId, dto.status, userId);
  }

  @NeedLogin()
  @Delete(':taskId')
  async remove(
    @Param('taskId') taskId: string,
  ): Promise<DeleteTaskResponse> {
    return this.forumTaskService.deleteTask(taskId);
  }
}
