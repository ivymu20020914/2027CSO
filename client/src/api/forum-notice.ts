import { axiosForBackend } from '@/runtime/http';
import { logger } from '@/runtime/logger';
import type {
  CreateNoticeRequest,
  CreateNoticeResponse,
  DeleteNoticeResponse,
  ForumNoticeDTO,
  ForumNoticeListResponse,
  UpdateNoticeRequest,
  UpdateNoticeResponse,
  UpdateNoticeStatusResponse,
} from '@shared/api.interface';
import type { Notice } from '@client/src/data/types';

export interface ForumNotice extends Omit<Notice, 'status' | 'scope'> {
  status: string;
  scope: string;
  updatedAt: string;
  updatedBy: string | null;
}

function toForumNotice(dto: ForumNoticeDTO): ForumNotice {
  return { ...dto };
}

export async function fetchForumNotices(): Promise<ForumNotice[]> {
  const response = await axiosForBackend.get<ForumNoticeListResponse>(
    '/api/forum-notices',
  );
  if (response.status === 403) {
    throw new Error('没有权限读取公告数据');
  }
  return response.data.items.map(toForumNotice);
}

export async function updateForumNoticeStatus(
  noticeId: string,
  status: string,
): Promise<ForumNotice> {
  const response = await axiosForBackend.patch<UpdateNoticeStatusResponse>(
    `/api/forum-notices/${encodeURIComponent(noticeId)}/status`,
    { status },
  );
  if (response.status === 403) {
    throw new Error('没有权限更新公告状态，请确认已登录');
  }
  logger.log({ level: 'info', args: ['公告状态已更新', noticeId, status] });
  return toForumNotice(response.data.notice);
}

export async function createForumNotice(
  body: CreateNoticeRequest,
): Promise<ForumNotice> {
  const response = await axiosForBackend.post<CreateNoticeResponse>(
    '/api/forum-notices',
    body,
  );
  if (response.status === 403) {
    throw new Error('没有权限新增公告，请确认已登录');
  }
  logger.log({
    level: 'info',
    args: ['公告已创建', response.data.notice.noticeId],
  });
  return toForumNotice(response.data.notice);
}

export async function updateForumNotice(
  noticeId: string,
  body: UpdateNoticeRequest,
): Promise<ForumNotice> {
  const response = await axiosForBackend.put<UpdateNoticeResponse>(
    `/api/forum-notices/${encodeURIComponent(noticeId)}`,
    body,
  );
  if (response.status === 403) {
    throw new Error('没有权限编辑公告，请确认已登录');
  }
  logger.log({ level: 'info', args: ['公告已编辑', noticeId] });
  return toForumNotice(response.data.notice);
}

export async function deleteForumNotice(noticeId: string): Promise<string> {
  const response = await axiosForBackend.delete<DeleteNoticeResponse>(
    `/api/forum-notices/${encodeURIComponent(noticeId)}`,
  );
  if (response.status === 403) {
    throw new Error('没有权限删除公告，请确认已登录');
  }
  logger.log({ level: 'info', args: ['公告已删除', noticeId] });
  return response.data.noticeId;
}
