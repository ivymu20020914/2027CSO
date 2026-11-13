import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createForumDecision,
  deleteForumDecision,
  fetchForumDecisions,
  updateForumDecision,
  updateForumDecisionStatus,
  type ForumDecision,
} from '@client/src/api/forum-decision';
import type {
  CreateDecisionRequest,
  UpdateDecisionRequest,
} from '@shared/api.interface';

const FORUM_DECISIONS_KEY = ['forum-decisions'] as const;

export function useForumDecisions() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: FORUM_DECISIONS_KEY,
    queryFn: fetchForumDecisions,
  });
  return {
    decisions: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useUpdateDecisionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      decisionId,
      status,
    }: {
      decisionId: string;
      status: string;
    }) => updateForumDecisionStatus(decisionId, status),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_DECISIONS_KEY });
    },
  });
}

export function useCreateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDecisionRequest) => createForumDecision(body),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_DECISIONS_KEY });
    },
  });
}

export function useUpdateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      decisionId,
      body,
    }: {
      decisionId: string;
      body: UpdateDecisionRequest;
    }) => updateForumDecision(decisionId, body),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_DECISIONS_KEY });
    },
  });
}

export function useDeleteDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (decisionId: string) => deleteForumDecision(decisionId),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_DECISIONS_KEY });
    },
  });
}

export type { ForumDecision };
