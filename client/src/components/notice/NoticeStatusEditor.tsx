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
import { useUpdateNoticeStatus } from '@client/src/hooks/useForumNotices';
import type { ForumNotice } from '@client/src/api/forum-notice';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import { useAuth } from '@/runtime/auth';

interface NoticeStatusEditorProps {
  notice: ForumNotice;
}

const NoticeStatusEditor = ({ notice }: NoticeStatusEditorProps) => {
  const { user } = useAuth();
  const mutation = useUpdateNoticeStatus();
  const { groups } = useForumOptions();
  const [status, setStatus] = useState<string>(notice.status);

  useEffect(() => {
    setStatus(notice.status);
  }, [notice.noticeId, notice.status]);

  const dirty: boolean = status !== notice.status;

  const handleSave = (): void => {
    mutation.mutate(
      { noticeId: notice.noticeId, status },
      {
        onSuccess: () =>
          toast.success(`公告 ${notice.noticeId} 状态已更新为「${status}」`),
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
          onValueChange={setStatus}
          disabled={!user || mutation.isPending}
        >
          <SelectTrigger
            className="h-9 w-44 rounded-none border-border bg-white text-[12px] shadow-none focus:ring-[#0033A0]"
            aria-label="选择公告状态"
          >
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {groups.statuses.map((s: string) => (
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
        {notice.updatedAt && (
          <span className="tnum text-[10px] font-medium text-[#94A3B8]">
            最近更新 {dayjs(notice.updatedAt).format('YYYY/MM/DD HH:mm')}
          </span>
        )}
      </div>
    </div>
  );
};

export { NoticeStatusEditor };
