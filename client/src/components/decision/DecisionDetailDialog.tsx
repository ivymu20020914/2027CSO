import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import {
  Badge,
  DecisionStatusBadge,
} from '@client/src/components/blueprint/StatusBadge';
import { formatDate } from '@client/src/data/selectors';
import { DecisionStatusEditor } from './DecisionStatusEditor';
import type { ForumDecision } from '@client/src/api/forum-decision';

interface DecisionDetailDialogProps {
  decision: ForumDecision | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (decision: ForumDecision) => void;
  onDelete?: (decision: ForumDecision) => void;
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

const DecisionDetailDialog = ({
  decision,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: DecisionDetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-t-[3px] border-t-[#0033A0] p-0 sm:max-w-2xl">
        {decision && (
          <>
            <DialogHeader className="border-b border-border p-6 pb-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="tnum text-[11px] font-bold text-[#94A3B8]">{decision.decisionId}</span>
                <Badge tone="brand">{decision.domain}</Badge>
                <DecisionStatusBadge status={decision.status} />
              </div>
              <DialogTitle className="text-base font-extrabold text-slate-900">
                {decision.question}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-end gap-2 px-6 pt-3">
              <Button writeAction
                variant="outline"
                size="sm"
                className="h-7 gap-1 rounded-none border-[#0033A0] px-2.5 text-[11px] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
                onClick={() => onEdit?.(decision)}
              >
                <Pencil className="size-3" />
                编辑内容
              </Button>
              <Button writeAction
                variant="outline"
                size="sm"
                className="h-7 gap-1 rounded-none border-[#DC2626] px-2.5 text-[11px] text-[#DC2626] hover:bg-[#DC2626] hover:text-white"
                aria-label={`删除决策 ${decision.decisionId}`}
                onClick={() => onDelete?.(decision)}
              >
                <Trash2 className="size-3" />
                删除
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-2">
              <FieldRow label="判断依据">{decision.basis || '—'}</FieldRow>
              <FieldRow label="影响与依赖">{decision.impact || '—'}</FieldRow>
              <FieldRow label="决定结论">{decision.conclusion || '待形成结论'}</FieldRow>
              <FieldRow label="最晚决定日">
                <span className="tnum">{formatDate(decision.deadline)}</span>
              </FieldRow>
              <FieldRow label="跟进/拍板">
                {decision.owner} ｜ {decision.decider}
              </FieldRow>
            </div>
            <DecisionStatusEditor decision={decision} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { DecisionDetailDialog };
