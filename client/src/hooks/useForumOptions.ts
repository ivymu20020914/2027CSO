import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createForumOption,
  fetchForumOptions,
} from '@client/src/api/forum-option';
import { buildOptionGroups } from '@client/src/lib/forum-options';
import type { OptionGroups } from '@client/src/lib/forum-options';
import type {
  CreateOptionRequest,
  ForumOptionDTO,
} from '@shared/api.interface';

const FORUM_OPTIONS_KEY = ['forum-options'] as const;

export function useForumOptions(): {
  groups: OptionGroups;
  options: ForumOptionDTO[];
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: FORUM_OPTIONS_KEY,
    queryFn: fetchForumOptions,
  });
  const options: ForumOptionDTO[] = data ?? [];
  return {
    groups: buildOptionGroups(options),
    options,
    isLoading,
    isError,
  };
}

export function useCreateForumOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOptionRequest) => createForumOption(body),
    retry: false,
    onSuccess: (option: ForumOptionDTO) => {
      queryClient.setQueryData<ForumOptionDTO[]>(
        FORUM_OPTIONS_KEY,
        (prev: ForumOptionDTO[] | undefined) => {
          const list: ForumOptionDTO[] = prev ?? [];
          const exists: boolean = list.some(
            (item: ForumOptionDTO) =>
              item.category === option.category && item.value === option.value,
          );
          return exists ? list : [...list, option];
        },
      );
      void queryClient.invalidateQueries({ queryKey: FORUM_OPTIONS_KEY });
    },
  });
}
