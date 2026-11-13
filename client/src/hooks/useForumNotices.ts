import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createForumNotice,
  deleteForumNotice,
  fetchForumNotices,
  updateForumNotice,
  updateForumNoticeStatus,
  type ForumNotice,
} from '@client/src/api/forum-notice';
import type {
  CreateNoticeRequest,
  UpdateNoticeRequest,
} from '@shared/api.interface';

const FORUM_NOTICES_KEY = ['forum-notices'] as const;

export function useForumNotices() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: FORUM_NOTICES_KEY,
    queryFn: fetchForumNotices,
  });
  return {
    notices: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useUpdateNoticeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      noticeId,
      status,
    }: {
      noticeId: string;
      status: string;
    }) => updateForumNoticeStatus(noticeId, status),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_NOTICES_KEY });
    },
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateNoticeRequest) => createForumNotice(body),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_NOTICES_KEY });
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      noticeId,
      body,
    }: {
      noticeId: string;
      body: UpdateNoticeRequest;
    }) => updateForumNotice(noticeId, body),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_NOTICES_KEY });
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noticeId: string) => deleteForumNotice(noticeId),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_NOTICES_KEY });
    },
  });
}

export type { ForumNotice };
