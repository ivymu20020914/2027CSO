import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Button } from '@client/src/components/ui/button';
import { useForumOptions } from '@client/src/hooks/useForumOptions';
import { useUpdateDecisionStatus } from '@client/src/hooks/useForumDecisions';
import type { ForumDecision } from '@client/src/api/forum-decision';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import { useAuth } from '@/runtime/auth';

interface DecisionStatusEditorProps {
  decision: ForumDecision;
}

const DecisionStatusEditor = ({ decision }: DecisionStatusEditorProps) => {
  const { user } = useAuth();
  const mutation = useUpdateDecisionStatus();
  const { groups } = useForumOptions();
  const [status, setStatus] = useState<string>(decision.status);

  useEffect(() => {
    setStatus(decision.status);
  }, [decision.decisionId, decision.status]);

  const dirty: boolean = status !== decision.status;

  const handleSave = (): void => {
    mutation.mutate(
      { decisionId: decision.decisionId, status },
      {
        onSuccess: () =>
          toast.success(`决策 ${decision.decisionId} 状态已更新为「${status}」`),
        onError: (error: unknown) =>
          toast.error(getApiErrorMessage(error, '状态更新失败，请稍后重试')),
      },
    );
  };

  return (
    <div className="border-t border-border bg-[#F8FAFC] px-6 py-4">
      <div className="bp-kpi-label mb-2.5">协作状态更新</div>
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={status}
          onValueChange={(v: string) => setStatus(v)}
          disabled={!user || mutation.isPending}
        >
          <SelectTrigger
            className="h-9 w-44 rounded-none border-border bg-white text-[12px] shadow-none focus:ring-[#0033A0]"
            aria-label="选择决策状态"
          >
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {groups.decisionStatuses.map((s: string) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button writeAction
          size="sm"
          className="rounded-none bg-[#0033A0] text-white hover:bg-[#00247D]"
          disabled={!dirty || mutation.isPending}
          onClick={handleSave}
        >
          {mutation.isPending ? '保存中…' : '保存状态'}
        </Button>
        {decision.updatedAt && (
          <span className="tnum text-[10px] font-medium text-[#94A3B8]">
            最近更新 {dayjs(decision.updatedAt).format('YYYY/MM/DD HH:mm')}
          </span>
        )}
      </div>
    </div>
  );
};

export { DecisionStatusEditor };
