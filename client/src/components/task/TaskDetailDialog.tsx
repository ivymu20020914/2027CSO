import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { Button } from '@client/src/components/ui/button';
import {
  TaskStatusBadge,
  PriorityBadge,
  Badge,
} from '@client/src/components/blueprint/StatusBadge';
import { getModuleName, formatDate } from '@client/src/data/selectors';
import { TaskStatusEditor } from './TaskStatusEditor';
import { TaskFormDialog } from './TaskFormDialog';
import { TaskDeleteDialog } from './TaskDeleteDialog';
import type { ForumTask } from '@client/src/api/forum-task';

interface TaskDetailDialogProps {
  task: ForumTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
}

const FieldRow = ({ label, children }: FieldRowProps) => (
  <div className="grid grid-cols-1 gap-1 bp-hairline-b py-3 md:grid-cols-[120px_1fr] md:gap-4">
    <div className="bp-kpi-label pt-0.5">{label}</div>
    <div className="text-[12px] font-medium leading-relaxed text-slate-700">{children}</div>
  </div>
);

const TaskDetailDialog = ({ task, open, onOpenChange }: TaskDetailDialogProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-none border-t-[3px] border-t-[#0033A0] p-0 sm:max-w-2xl">
          {task && (
            <>
              <DialogHeader className="border-b border-border p-6 pb-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="tnum text-[11px] font-bold text-[#94A3B8]">{task.taskId}</span>
                  <Badge tone="brand">{getModuleName(task.moduleId)}</Badge>
                  <TaskStatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="text-base font-extrabold text-slate-900">
                    {task.name}
                  </DialogTitle>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button writeAction
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`编辑任务 ${task.taskId}`}
                      className="h-7 rounded-none text-[11px] font-bold text-[#0033A0] hover:bg-[#CCE0FF]/40"
                      onClick={() => setFormOpen(true)}
                    >
                      <Pencil className="size-3.5" />
                      编辑
                    </Button>
                    <Button writeAction
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`删除任务 ${task.taskId}`}
                      className="h-7 rounded-none text-[11px] font-bold text-[#DC2626] hover:bg-red-50"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="size-3.5" />
                      删除
                    </Button>
                  </div>
                </div>
                <p className="bp-sublabel mt-1">{task.stage}</p>
              </DialogHeader>
              <div className="max-h-[55vh] overflow-y-auto px-6 py-2">
                <FieldRow label="具体动作">{task.action || '—'}</FieldRow>
                <FieldRow label="起止日期">
                  <span className="tnum">
                    {formatDate(task.startDate)} ~ {formatDate(task.endDate)}
                  </span>
                </FieldRow>
                <FieldRow label="主责人">{task.owner || '—'}</FieldRow>
                <FieldRow label="协同人">{task.collaborators || '—'}</FieldRow>
                <FieldRow label="审核/决策人">{task.reviewer || '—'}</FieldRow>
                <FieldRow label="验收交付物">{task.deliverable || '—'}</FieldRow>
              </div>
              <TaskStatusEditor task={task} />
            </>
          )}
        </DialogContent>
      </Dialog>

      <TaskFormDialog
        open={formOpen}
        mode="edit"
        task={task}
        onOpenChange={setFormOpen}
        onSuccess={() => onOpenChange(false)}
      />
      <TaskDeleteDialog
        task={task}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => onOpenChange(false)}
      />
    </>
  );
};

export { TaskDetailDialog };
