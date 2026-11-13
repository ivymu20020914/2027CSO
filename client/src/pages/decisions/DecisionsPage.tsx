import { useMemo, useState } from 'react';
import { CalendarClock, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';
import {
  CreatableSelect,
  type CreatableOption,
} from '@client/src/components/ui/creatable-select';
import { ReportCard } from '@client/src/components/blueprint/ReportCard';
import { SectionHeader } from '@client/src/components/blueprint/SectionHeader';
import { KpiCard, KpiRow } from '@client/src/components/blueprint/KpiCard';
import { EmptyState } from '@client/src/components/blueprint/EmptyState';
import { Badge, DecisionStatusBadge } from '@client/src/components/blueprint/StatusBadge';
import { DecisionDetailDialog } from '@client/src/components/decision/DecisionDetailDialog';
import { DecisionFormDialog } from '@client/src/components/decision/DecisionFormDialog';
import { DecisionDeleteDialog } from '@client/src/components/decision/DecisionDeleteDialog';
import { formatDate, formatShortDate } from '@client/src/data/selectors';
import { useForumDecisions } from '@client/src/hooks/useForumDecisions';
import { useForumOptions } from '@client/src/hooks/useForumOptions';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import type { ForumDecision } from '@client/src/api/forum-decision';

const DecisionListSkeleton = () => (
  <ul className="space-y-3">
    {Array.from({ length: 6 }).map((_, i: number) => (
      <li
        key={i}
        className="flex flex-col gap-3 border border-border bg-white p-4 md:flex-row md:items-start md:justify-between"
      >
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24 rounded-none" />
          <Skeleton className="h-4 w-2/3 rounded-none" />
          <Skeleton className="h-3 w-1/2 rounded-none" />
        </div>
        <Skeleton className="h-4 w-16 rounded-none" />
      </li>
    ))}
  </ul>
);

const DecisionsPage = () => {
  const [domain, setDomain] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [selected, setSelected] = useState<ForumDecision | null>(null);
  const [editing, setEditing] = useState<ForumDecision | null>(null);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<ForumDecision | null>(null);
  const { decisions, isLoading, isError, error, refetch } = useForumDecisions();
  const { groups } = useForumOptions();

  const statusOptions: CreatableOption[] = useMemo(
    () =>
      groups.decisionStatuses.map((s: string) => ({ value: s, label: s })),
    [groups.decisionStatuses],
  );

  const domains: string[] = useMemo(
    () => Array.from(new Set(decisions.map((d) => d.domain))),
    [decisions],
  );
  const earliest: string = useMemo(
    () =>
      decisions.length === 0
        ? ''
        : decisions.map((d) => d.deadline).sort()[0],
    [decisions],
  );
  const pendingCount: number = useMemo(
    () => decisions.filter((d) => d.status === '待确认').length,
    [decisions],
  );
  const confirmedCount: number = useMemo(
    () => decisions.filter((d) => d.status === '已确认').length,
    [decisions],
  );

  const filtered: ForumDecision[] = useMemo(
    () =>
      decisions
        .filter((d) => domain === 'all' || d.domain === domain)
        .filter((d) => status === 'all' || d.status === status)
        .sort((a, b) => a.deadline.localeCompare(b.deadline)),
    [domain, status, decisions],
  );

  return (
    <div className="rise space-y-6">
      <SectionHeader index="05" title="待确认决策与关键风险" english="Open Decisions & Risks · 25 Items" />

      <ReportCard className="!p-0">
        <KpiRow>
          <KpiCard label="决策事项" value={isLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : decisions.length} />
          <KpiCard
            label="待确认"
            value={isLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : pendingCount}
            badge={<Badge tone="warning">待拍板</Badge>}
          />
          <KpiCard label="已确认" value={isLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : confirmedCount} badge={<Badge tone="success">已闭环</Badge>} />
          <KpiCard label="涉及领域" value={isLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : domains.length} />
          <KpiCard label="最早决定日" value={isLoading ? <Skeleton className="h-6 w-16 rounded-none" /> : formatShortDate(earliest)} />
        </KpiRow>
      </ReportCard>

      <ReportCard>
        <ReportCard.Header
          label="Decision Log"
          title="决策清单（按最晚决定日升序）"
          english="尚未批准的条件不得当作已落实，点击查看原方案决策明细"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button writeAction
                size="sm"
                className="rounded-none bg-[#0033A0] text-white hover:bg-[#00247D]"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-3.5" />
                新增决策
              </Button>
              <CreatableSelect
                category="decision_status"
                label="决策状态"
                value={status}
                options={statusOptions}
                onChange={setStatus}
                placeholder="全部状态"
                ariaLabel="按决策状态筛选"
                triggerClassName="h-8 w-[150px] rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]"
                leadingOption={{ value: 'all', label: '全部状态' }}
              />
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger className="h-8 w-[150px] rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]">
                  <SelectValue placeholder="全部领域" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">全部领域</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
        {isLoading ? (
          <DecisionListSkeleton />
        ) : isError ? (
          <EmptyState
            title="决策数据加载失败"
            description={getApiErrorMessage(error, '无法连接决策数据，请稍后重试。')}
            action={
              <Button
                variant="outline"
                size="sm"
                className="rounded-none border-[#0033A0] text-[#0033A0]"
                onClick={() => refetch()}
              >
                重新加载
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="没有匹配的决策" description="当前领域或状态筛选下没有决策，请调整筛选条件查看。" />
        ) : (
          <ul className="space-y-3">
            {filtered.map((d: ForumDecision) => (
              <li
                key={d.decisionId}
                role="button"
                tabIndex={0}
                aria-label={`查看决策 ${d.decisionId}`}
                onClick={() => setSelected(d)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(d);
                  }
                }}
                className="flex cursor-pointer flex-col gap-3 border border-border bg-white p-4 transition-colors hover:border-[#0033A0]/40 hover:bg-slate-50 md:flex-row md:items-start md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="tnum text-[10px] font-bold text-[#94A3B8]">{d.decisionId}</span>
                    <Badge tone="brand">{d.domain}</Badge>
                    <DecisionStatusBadge status={d.status} />
                  </div>
                  <p className="text-[13px] font-bold leading-snug text-slate-800">{d.question}</p>
                  <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[#94A3B8]">
                    {d.basis}
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-slate-600">
                    <span className="bp-kpi-label mr-1">影响与依赖</span>
                    {d.impact}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-1 border-l border-border pl-4 md:items-end">
                  <div className="flex items-center gap-1.5 text-[#0033A0]">
                    <CalendarClock className="size-3.5" />
                    <span className="tnum text-[12px] font-bold">{formatDate(d.deadline)}</span>
                  </div>
                  <div className="text-[10px] font-medium text-[#94A3B8]">
                    跟进 {d.owner} ｜ 拍板 {d.decider}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <Button writeAction
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 rounded-none border-[#0033A0] px-2.5 text-[11px] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
                      aria-label={`编辑决策 ${d.decisionId} 内容`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(d);
                      }}
                    >
                      <Pencil className="size-3" />
                      编辑
                    </Button>
                    <Button writeAction
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 rounded-none border-border px-2.5 text-[11px] text-slate-600 hover:bg-slate-100"
                      aria-label={`更新决策 ${d.decisionId} 状态`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(d);
                      }}
                    >
                      <RefreshCw className="size-3" />
                      状态
                    </Button>
                    <Button writeAction
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 rounded-none border-[#DC2626] px-2.5 text-[11px] text-[#DC2626] hover:bg-[#DC2626] hover:text-white"
                      aria-label={`删除决策 ${d.decisionId}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleting(d);
                      }}
                    >
                      <Trash2 className="size-3" />
                      删除
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ReportCard>

      <DecisionDetailDialog
        decision={selected}
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
        onEdit={(d) => {
          setSelected(null);
          setEditing(d);
        }}
        onDelete={(d) => {
          setSelected(null);
          setDeleting(d);
        }}
      />
      <DecisionFormDialog
        decision={editing}
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      />
      <DecisionFormDialog
        open={createOpen}
        decision={null}
        onOpenChange={setCreateOpen}
      />
      <DecisionDeleteDialog
        decision={deleting}
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
      />
      <p className="text-[10px] font-medium text-[#94A3B8]">
        决策事项共 {decisions.length} 项，点击任意条目查看明细。登录后可新增、编辑、删除及更新状态，保存后多设备同步。
      </p>
    </div>
  );
};

export default DecisionsPage;
