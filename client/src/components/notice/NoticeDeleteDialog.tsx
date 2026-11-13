import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@client/src/components/ui/alert-dialog';
import { Button } from '@client/src/components/ui/button';
import { useDeleteNotice } from '@client/src/hooks/useForumNotices';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import type { ForumNotice } from '@client/src/api/forum-notice';

interface NoticeDeleteDialogProps {
  notice: ForumNotice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

const NoticeDeleteDialog = ({
  notice,
  open,
  onOpenChange,
  onDeleted,
}: NoticeDeleteDialogProps) => {
  const mutation = useDeleteNotice();

  const handleDelete = (): void => {
    if (!notice) return;
    mutation.mutate(notice.noticeId, {
      onSuccess: () => {
        toast.success(`公告 ${notice.noticeId} 已删除`);
        onOpenChange(false);
        onDeleted?.();
      },
      onError: (error: unknown) =>
        toast.error(getApiErrorMessage(error, '删除公告失败，请稍后重试')),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-none border-t-[3px] border-t-[#DC2626] p-0 sm:max-w-md">
        <AlertDialogHeader className="gap-2 p-6 pb-4">
          <AlertDialogTitle className="text-base font-extrabold text-slate-900">
            删除公告 {notice?.noticeId ?? ''}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[12px] leading-relaxed text-slate-600">
            确定要删除「{notice?.title ?? ''}」吗？该操作会从公告台账中永久移除这条记录，且无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 px-6 pb-6">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={mutation.isPending}
            >
              取消
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button writeAction
              variant="destructive"
              size="sm"
              className="rounded-none"
              aria-label="确认删除公告"
              disabled={mutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {mutation.isPending ? '删除中…' : '确认删除'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { NoticeDeleteDialog };
