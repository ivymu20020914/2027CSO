import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createForumTask,
  deleteForumTask,
  fetchForumTasks,
  updateForumTask,
  updateForumTaskStatus,
  type ForumTask,
} from '@client/src/api/forum-task';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@shared/api.interface';

const FORUM_TASKS_KEY = ['forum-tasks'] as const;

export function useForumTasks() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: FORUM_TASKS_KEY,
    queryFn: fetchForumTasks,
  });
  return {
    tasks: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: string;
    }) => updateForumTaskStatus(taskId, status),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_TASKS_KEY });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTaskRequest) => createForumTask(body),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_TASKS_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      body,
    }: {
      taskId: string;
      body: UpdateTaskRequest;
    }) => updateForumTask(taskId, body),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_TASKS_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteForumTask(taskId),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FORUM_TASKS_KEY });
    },
  });
}

export type { ForumTask };
