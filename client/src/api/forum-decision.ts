import { axiosForBackend } from '@/runtime/http';
import { logger } from '@/runtime/logger';
import type {
  CreateDecisionRequest,
  CreateDecisionResponse,
  DeleteDecisionResponse,
  ForumDecisionDTO,
  ForumDecisionListResponse,
  UpdateDecisionRequest,
  UpdateDecisionResponse,
  UpdateDecisionStatusResponse,
} from '@shared/api.interface';
import type { Decision } from '@client/src/data/types';

export interface ForumDecision extends Omit<Decision, 'status'> {
  status: string;
  updatedAt: string;
  updatedBy: string | null;
}

function toForumDecision(dto: ForumDecisionDTO): ForumDecision {
  return { ...dto };
}

export async function fetchForumDecisions(): Promise<ForumDecision[]> {
  const response = await axiosForBackend.get<ForumDecisionListResponse>(
    '/api/forum-decisions',
  );
  if (response.status === 403) {
    throw new Error('没有权限读取决策数据');
  }
  return response.data.items.map(toForumDecision);
}

export async function updateForumDecisionStatus(
  decisionId: string,
  status: string,
): Promise<ForumDecision> {
  const response = await axiosForBackend.patch<UpdateDecisionStatusResponse>(
    `/api/forum-decisions/${encodeURIComponent(decisionId)}/status`,
    { status },
  );
  if (response.status === 403) {
    throw new Error('没有权限更新决策状态，请确认已登录');
  }
  logger.log({ level: 'info', args: ['决策状态已更新', decisionId, status] });
  return toForumDecision(response.data.decision);
}

export async function createForumDecision(
  body: CreateDecisionRequest,
): Promise<ForumDecision> {
  const response = await axiosForBackend.post<CreateDecisionResponse>(
    '/api/forum-decisions',
    body,
  );
  if (response.status === 403) {
    throw new Error('没有权限新增决策，请确认已登录');
  }
  logger.log({
    level: 'info',
    args: ['决策已创建', response.data.decision.decisionId],
  });
  return toForumDecision(response.data.decision);
}

export async function updateForumDecision(
  decisionId: string,
  body: UpdateDecisionRequest,
): Promise<ForumDecision> {
  const response = await axiosForBackend.put<UpdateDecisionResponse>(
    `/api/forum-decisions/${encodeURIComponent(decisionId)}`,
    body,
  );
  if (response.status === 403) {
    throw new Error('没有权限编辑决策，请确认已登录');
  }
  logger.log({ level: 'info', args: ['决策已编辑', decisionId] });
  return toForumDecision(response.data.decision);
}

export async function deleteForumDecision(
  decisionId: string,
): Promise<string> {
  const response = await axiosForBackend.delete<DeleteDecisionResponse>(
    `/api/forum-decisions/${encodeURIComponent(decisionId)}`,
  );
  if (response.status === 403) {
    throw new Error('没有权限删除决策，请确认已登录');
  }
  logger.log({ level: 'info', args: ['决策已删除', decisionId] });
  return response.data.decisionId;
}
