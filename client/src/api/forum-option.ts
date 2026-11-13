import { axiosForBackend } from '@/runtime/http';
import { logger } from '@/runtime/logger';
import type {
  CreateOptionRequest,
  CreateOptionResponse,
  ForumOptionDTO,
  ForumOptionListResponse,
} from '@shared/api.interface';

export async function fetchForumOptions(): Promise<ForumOptionDTO[]> {
  const response = await axiosForBackend.get<ForumOptionListResponse>(
    '/api/forum-options',
  );
  if (response.status === 403) {
    throw new Error('没有权限读取选项配置');
  }
  return response.data.items;
}

export async function createForumOption(
  body: CreateOptionRequest,
): Promise<ForumOptionDTO> {
  const response = await axiosForBackend.post<CreateOptionResponse>(
    '/api/forum-options',
    body,
  );
  if (response.status === 403) {
    throw new Error('没有权限新增选项，请确认已登录');
  }
  logger.log({
    level: 'info',
    args: ['选项已新增', body.category, body.value],
  });
  return response.data.option;
}
