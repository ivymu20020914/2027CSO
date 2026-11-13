import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { eq, like } from 'drizzle-orm';
import { forumTask } from '@server/database/schema';
import type {
  CreateTaskDto,
  UpdateTaskDto,
} from './forum-task.dto';
import type { ForumTaskDTO } from '@shared/api.interface';

type ForumTaskRow = typeof forumTask.$inferSelect;
type TaskInsert = typeof forumTask.$inferInsert;

function extractPostgresErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const { code, cause } = current as { code?: unknown; cause?: unknown };
    if (typeof code === 'string') return code;
    current = cause;
  }
  return undefined;
}

@Injectable()
export class ForumTaskService {
  private readonly logger = new Logger(ForumTaskService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  private toDto(row: ForumTaskRow): ForumTaskDTO {
    return {
      taskId: row.taskId,
      moduleId: row.moduleId,
      moduleSheet: row.moduleSheet ?? '',
      stage: row.stage ?? '',
      name: row.name,
      action: row.action ?? '',
      startDate: row.startDate ?? '',
      endDate: row.endDate ?? '',
      owner: row.owner,
      status: row.status,
      collaborators: row.collaborators ?? '',
      reviewer: row.reviewer ?? '',
      deliverable: row.deliverable ?? '',
      priority: row.priority,
      updatedAt: row.updatedAt.toISOString(),
      updatedBy: row.updatedBy ?? null,
    };
  }

  private mapEditableFields(dto: CreateTaskDto | UpdateTaskDto): Omit<
    TaskInsert,
    'taskId' | 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  > {
    return {
      moduleId: dto.moduleId,
      moduleSheet: dto.moduleSheet,
      stage: dto.stage,
      name: dto.name,
      action: dto.action,
      startDate: dto.startDate,
      endDate: dto.endDate,
      owner: dto.owner,
      status: dto.status,
      collaborators: dto.collaborators,
      reviewer: dto.reviewer,
      deliverable: dto.deliverable,
      priority: dto.priority,
    };
  }

  private async nextTaskId(): Promise<string> {
    const rows = await this.db
      .select({ taskId: forumTask.taskId })
      .from(forumTask)
      .where(like(forumTask.taskId, 'N%'));
    let max = 0;
    for (const row of rows) {
      const matched = /^N(\d+)$/.exec(row.taskId);
      if (matched) max = Math.max(max, Number(matched[1]));
    }
    return `N${String(max + 1).padStart(3, '0')}`;
  }

  async listTasks(): Promise<{ items: ForumTaskDTO[]; total: number }> {
    const rows: ForumTaskRow[] = await this.db
      .select()
      .from(forumTask)
      .orderBy(forumTask.taskId);
    return { items: rows.map((row) => this.toDto(row)), total: rows.length };
  }

  async createTask(
    dto: CreateTaskDto,
    userId: string,
  ): Promise<{ task: ForumTaskDTO }> {
    const fields = this.mapEditableFields(dto);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const taskId = await this.nextTaskId();
      try {
        const rows = await this.db
          .insert(forumTask)
          .values({
            ...fields,
            taskId,
            updatedAt: new Date(),
            updatedBy: userId,
          })
          .returning();
        this.logger.log(`创建任务 ${taskId}，操作人 ${userId}`);
        return { task: this.toDto(rows[0]) };
      } catch (error) {
        if (extractPostgresErrorCode(error) === '23505' && attempt < 4) {
          continue;
        }
        throw error;
      }
    }
    throw new ConflictException('任务编号生成冲突，请稍后重试');
  }

  async updateTask(
    taskId: string,
    dto: UpdateTaskDto,
    userId: string,
  ): Promise<{ task: ForumTaskDTO }> {
    const rows = await this.db
      .update(forumTask)
      .set({
        ...this.mapEditableFields(dto),
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(forumTask.taskId, taskId))
      .returning();

    if (rows.length === 0) {
      throw new NotFoundException(`任务 ${taskId} 不存在`);
    }
    this.logger.log(`编辑任务 ${taskId}，操作人 ${userId}`);
    return { task: this.toDto(rows[0]) };
  }

  async updateStatus(
    taskId: string,
    status: string,
    userId: string,
  ): Promise<{ task: ForumTaskDTO }> {
    const rows = await this.db
      .update(forumTask)
      .set({
        status,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(forumTask.taskId, taskId))
      .returning();

    if (rows.length === 0) {
      throw new NotFoundException(`任务 ${taskId} 不存在`);
    }
    this.logger.log(`任务 ${taskId} 状态更新为 ${status}，操作人 ${userId}`);
    return { task: this.toDto(rows[0]) };
  }

  async deleteTask(taskId: string): Promise<{ taskId: string }> {
    const rows = await this.db
      .delete(forumTask)
      .where(eq(forumTask.taskId, taskId))
      .returning({ taskId: forumTask.taskId });

    if (rows.length === 0) {
      throw new NotFoundException(`任务 ${taskId} 不存在`);
    }
    this.logger.log(`删除任务 ${taskId}`);
    return { taskId: rows[0].taskId };
  }
}
