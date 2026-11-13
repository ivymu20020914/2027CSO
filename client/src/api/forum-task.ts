import { axiosForBackend } from '@/runtime/http';
import { logger } from '@/runtime/logger';
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  DeleteTaskResponse,
  ForumTaskDTO,
  ForumTaskListResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  UpdateTaskStatusResponse,
} from '@shared/api.interface';
import type { Task } from '@client/src/data/types';

export interface ForumTask extends Omit<Task, 'status' | 'priority'> {
  status: string;
  priority: string;
  updatedAt: string;
  updatedBy: string | null;
}

function toForumTask(dto: ForumTaskDTO): ForumTask {
  return { ...dto };
}

export async function fetchForumTasks(): Promise<ForumTask[]> {
  const response = await axiosForBackend.get<ForumTaskListResponse>(
    '/api/forum-tasks',
  );
  if (response.status === 403) {
    throw new Error('没有权限读取任务数据');
  }
  return response.data.items.map(toForumTask);
}

export async function updateForumTaskStatus(
  taskId: string,
  status: string,
): Promise<ForumTask> {
  const response = await axiosForBackend.patch<UpdateTaskStatusResponse>(
    `/api/forum-tasks/${encodeURIComponent(taskId)}/status`,
    { status },
  );
  if (response.status === 403) {
    throw new Error('没有权限更新任务状态，请确认已登录');
  }
  logger.log({ level: 'info', args: ['任务状态已更新', taskId, status] });
  return toForumTask(response.data.task);
}

export async function createForumTask(
  body: CreateTaskRequest,
): Promise<ForumTask> {
  const response = await axiosForBackend.post<CreateTaskResponse>(
    '/api/forum-tasks',
    body,
  );
  if (response.status === 403) {
    throw new Error('没有权限创建任务，请确认已登录');
  }
  logger.log({ level: 'info', args: ['任务已创建', response.data.task.taskId] });
  return toForumTask(response.data.task);
}

export async function updateForumTask(
  taskId: string,
  body: UpdateTaskRequest,
): Promise<ForumTask> {
  const response = await axiosForBackend.put<UpdateTaskResponse>(
    `/api/forum-tasks/${encodeURIComponent(taskId)}`,
    body,
  );
  if (response.status === 403) {
    throw new Error('没有权限编辑任务，请确认已登录');
  }
  logger.log({ level: 'info', args: ['任务已编辑', taskId] });
  return toForumTask(response.data.task);
}

export async function deleteForumTask(taskId: string): Promise<string> {
  const response = await axiosForBackend.delete<DeleteTaskResponse>(
    `/api/forum-tasks/${encodeURIComponent(taskId)}`,
  );
  if (response.status === 403) {
    throw new Error('没有权限删除任务，请确认已登录');
  }
  logger.log({ level: 'info', args: ['任务已删除', taskId] });
  return response.data.taskId;
}
