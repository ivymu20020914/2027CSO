import type { TaskStatus, Priority, NoticeScope, DecisionStatus } from '@client/src/data/types';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-500',
  brand: 'bg-[#CCE0FF] text-[#0033A0]',
  success: 'bg-status-success-bg text-[#059669]',
  warning: 'bg-status-warning-bg text-[#B45309]',
  danger: 'bg-status-danger-bg text-[#DC2626]',
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ tone = 'neutral', children, className = '' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold leading-none ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
};

const TASK_STATUS_TONE: Record<TaskStatus, Tone> = {
  未开始: 'neutral',
  进行中: 'brand',
  已完成: 'success',
  待审核: 'warning',
  已阻塞: 'danger',
};

const PRIORITY_TONE: Record<Priority, Tone> = {
  高: 'danger',
  中: 'warning',
  低: 'neutral',
};

const SCOPE_TONE: Record<NoticeScope, Tone> = {
  对内: 'neutral',
  对外公开: 'brand',
  对外定向: 'warning',
};

const DECISION_TONE: Record<DecisionStatus, Tone> = {
  待确认: 'warning',
  已确认: 'success',
  已关闭: 'neutral',
};

const TaskStatusBadge = ({ status }: { status: string }) => (
  <Badge tone={TASK_STATUS_TONE[status as TaskStatus] ?? 'neutral'}>
    {status}
  </Badge>
);

const PriorityBadge = ({ priority }: { priority: string }) => (
  <Badge tone={PRIORITY_TONE[priority as Priority] ?? 'neutral'}>
    {priority}优先
  </Badge>
);

const ScopeBadge = ({ scope }: { scope: string }) => (
  <Badge tone={SCOPE_TONE[scope as NoticeScope] ?? 'neutral'}>{scope}</Badge>
);

const DecisionStatusBadge = ({ status }: { status: string }) => (
  <Badge tone={DECISION_TONE[status as DecisionStatus] ?? 'neutral'}>
    {status}
  </Badge>
);

export { Badge, TaskStatusBadge, PriorityBadge, ScopeBadge, DecisionStatusBadge };
