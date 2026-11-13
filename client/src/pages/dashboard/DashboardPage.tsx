import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Megaphone } from 'lucide-react';
import { MILESTONES } from '@client/src/data/project';
import {
  moduleStats,
  taskStatusStats,
  formatShortDate,
  daysUntil,
} from '@client/src/data/selectors';
import { useForumDecisions } from '@client/src/hooks/useForumDecisions';
import { useForumNotices } from '@client/src/hooks/useForumNotices';
import { ReportCard } from '@client/src/components/blueprint/ReportCard';
import { SectionHeader } from '@client/src/components/blueprint/SectionHeader';
import { KpiCard, KpiRow } from '@client/src/components/blueprint/KpiCard';
import { Badge } from '@client/src/components/blueprint/StatusBadge';
import { VerdictCard } from '@client/src/components/blueprint/VerdictCard';
import { MilestoneTimeline } from '@client/src/components/blueprint/MilestoneTimeline';
import { DataTable, type TableColumn } from '@client/src/components/blueprint/DataTable';
import { EmptyState } from '@client/src/components/blueprint/EmptyState';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import { ModuleTaskBarChart } from '@client/src/components/charts/ModuleTaskBarChart';
import { OwnerDonutChart } from '@client/src/components/charts/OwnerDonutChart';
import { ProjectHero } from './ProjectHero';
import { useForumTasks } from '@client/src/hooks/useForumTasks';
import { useForumOptions } from '@client/src/hooks/useForumOptions';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import type { ModuleStat } from '@client/src/data/selectors';
import type { ForumDecision } from '@client/src/api/forum-decision';
import type { ForumNotice } from '@client/src/api/forum-notice';

const ChartSkeleton = () => (
  <div className="flex h-[320px] flex-col justify-between p-2" aria-busy="true">
    {Array.from({ length: 8 }).map((_, i: number) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-3 w-16 rounded-none" />
        <Skeleton
          className="h-4 rounded-none bg-[#CCE0FF]"
          style={{ width: `${72 - i * 7}%` }}
        />
      </div>
    ))}
  </div>
);

const MatrixSkeleton = () => (
  <div className="space-y-3 p-4" aria-busy="true">
    {Array.from({ length: 8 }).map((_, i: number) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-3 w-32 rounded-none" />
        <Skeleton className="h-3 w-12 rounded-none" />
        <Skeleton className="h-3 flex-1 rounded-none" />
        <Skeleton className="h-4 w-10 rounded-none" />
      </div>
    ))}
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { tasks, isLoading, isError, error, refetch } = useForumTasks();
  const { decisions, isLoading: decisionsLoading } = useForumDecisions();
  const { notices, isLoading: noticesLoading } = useForumNotices();
  const { groups } = useForumOptions();

  const stats: ModuleStat[] = useMemo(
    () => moduleStats(tasks, groups.modules),
    [tasks, groups.modules],
  );
  const statusStats = useMemo(() => taskStatusStats(tasks), [tasks]);
  const notStarted: number =
    statusStats.find((s) => s.status === '未开始')?.count ?? 0;
  const inProgress: number =
    statusStats.find((s) => s.status === '进行中')?.count ?? 0;
  const done: number =
    statusStats.find((s) => s.status === '已完成')?.count ?? 0;

  const pendingDecisionCount: number = useMemo(
    () => decisions.filter((d) => d.status === '待确认').length,
    [decisions],
  );
  const urgentDecisions: ForumDecision[] = useMemo(
    () =>
      [...decisions]
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .slice(0, 6),
    [decisions],
  );
  const nextNotices: ForumNotice[] = useMemo(
    () =>
      [...notices]
        .sort((a, b) => a.publishDate.localeCompare(b.publishDate))
        .slice(0, 5),
    [notices],
  );

  const moduleColumns: TableColumn<ModuleStat>[] = [
    {
      key: 'module',
      header: '执行模块',
      primary: true,
      render: (row) => (
        <span className="flex items-center gap-1">
          <span className="tnum text-[10px] text-[#94A3B8]">{row.module.moduleId}</span>
          {row.module.name}
        </span>
      ),
    },
    { key: 'owner', header: '主责', render: (row) => row.module.owner },
    { key: 'total', header: '任务数', align: 'right', mono: true, render: (row) => row.total },
    { key: 'inProgress', header: '进行中', align: 'right', mono: true, render: (row) => row.inProgress },
    { key: 'done', header: '已完成', align: 'right', mono: true, render: (row) => row.done },
    { key: 'high', header: '高优先级', align: 'right', mono: true, render: (row) => row.high },
    {
      key: 'milestone',
      header: '关键里程碑',
      render: (row) => (
        <span className="text-[11px] font-medium text-slate-600">{row.module.milestone}</span>
      ),
    },
  ];

  const dynamicValue = (v: number): React.ReactNode =>
    isLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : v;

  return (
    <div className="rise -mt-10 space-y-8">
      <ProjectHero />

      <section>
        <SectionHeader index="01" title="核心指标总览" english="Key Performance Overview" />
        <ReportCard className="!p-0">
          <KpiRow>
            <KpiCard label="全量任务" value={dynamicValue(tasks.length)} aux={`${stats.length} 个执行模块`} />
            <KpiCard
              label="进行中 / 已完成"
              value={isLoading ? <Skeleton className="h-6 w-16 rounded-none" /> : `${inProgress} / ${done}`}
              badge={<Badge tone="brand">实时</Badge>}
            />
            <KpiCard label="未开始" value={dynamicValue(notStarted)} badge={<Badge tone="neutral">初始态</Badge>} />
            <KpiCard label="通知公告" value={noticesLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : notices.length} aux="对内30 / 公开22 / 定向7" />
            <KpiCard label="待确认决策" value={decisionsLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : pendingDecisionCount} badge={<Badge tone="warning">待拍板</Badge>} />
          </KpiRow>
        </ReportCard>
      </section>

      <section>
        <SectionHeader index="02" title="工作量分布" english="Workload Distribution" />
        <div className="grid gap-8 lg:grid-cols-12">
          <ReportCard className="lg:col-span-7">
            <ReportCard.Header label="By Workstream" title="各模块任务总量" english="Tasks per Module" />
            {isError ? (
              <EmptyState
                title="图表数据加载失败"
                description={getApiErrorMessage(error, '无法获取任务统计，请稍后重试。')}
                action={<Button variant="outline" size="sm" className="rounded-none border-[#0033A0] text-[#0033A0]" onClick={() => refetch()}>重新加载</Button>}
              />
            ) : isLoading ? (
              <ChartSkeleton />
            ) : (
              <ModuleTaskBarChart tasks={tasks} />
            )}
          </ReportCard>
          <ReportCard className="lg:col-span-5">
            <ReportCard.Header label="By Owner" title="主责人任务占比" english="Owner Allocation" />
            {isError ? (
              <EmptyState title="图表数据加载失败" description="请稍后重试。" action={<Button variant="outline" size="sm" className="rounded-none border-[#0033A0] text-[#0033A0]" onClick={() => refetch()}>重新加载</Button>} />
            ) : isLoading ? (
              <ChartSkeleton />
            ) : (
              <OwnerDonutChart tasks={tasks} />
            )}
          </ReportCard>
        </div>
      </section>

      <section>
        <SectionHeader
          index="03"
          title="模块任务分布与主责"
          english="Module Responsibility Matrix"
          action={
            <Link to="/tasks" className="flex items-center gap-1 text-[11px] font-bold text-[#0033A0] hover:underline">
              进入任务中心 <ArrowRight className="size-3" />
            </Link>
          }
        />
        <ReportCard className="!p-2">
          {isError ? (
            <EmptyState
              title="模块数据加载失败"
              description={getApiErrorMessage(error, '无法获取模块任务数据，请稍后重试。')}
              action={<Button variant="outline" size="sm" className="rounded-none border-[#0033A0] text-[#0033A0]" onClick={() => refetch()}>重新加载</Button>}
            />
          ) : isLoading ? (
            <MatrixSkeleton />
          ) : (
            <DataTable
              columns={moduleColumns}
              data={stats}
              rowKey={(row) => row.module.moduleId}
              onRowClick={(row) => navigate(`/modules/${row.module.moduleId}`)}
            />
          )}
        </ReportCard>
      </section>

      <section>
        <SectionHeader index="04" title="关键节点与待决策" english="Milestones & Open Decisions" />
        <div className="grid gap-8 lg:grid-cols-12">
          <ReportCard className="lg:col-span-7">
            <ReportCard.Header label="Timeline" title="关键里程碑" english={`${MILESTONES.length} Critical Milestones`} />
            <MilestoneTimeline />
          </ReportCard>
          <ReportCard className="lg:col-span-5">
            <ReportCard.Header
              label="Risk"
              title="最近待确认决策"
              english="Nearest Deadlines"
              action={
                <Link to="/decisions" className="flex items-center gap-1 text-[11px] font-bold text-[#0033A0] hover:underline">
                  全部 <ArrowRight className="size-3" />
                </Link>
              }
            />
            {decisionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-3 border-l-2 border-slate-200 pl-3">
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-20 rounded-none" />
                      <Skeleton className="h-3 w-3/4 rounded-none" />
                    </div>
                    <Skeleton className="h-3 w-10 rounded-none" />
                  </div>
                ))}
              </div>
            ) : (
            <ul className="space-y-3">
              {urgentDecisions.map((d: ForumDecision) => (
                <li key={d.decisionId} className="flex items-start justify-between gap-3 border-l-2 border-slate-200 pl-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="tnum text-[10px] font-bold text-[#94A3B8]">{d.decisionId}</span>
                      <Badge tone="warning">{d.domain}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-snug text-slate-800">{d.question}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="tnum text-[11px] font-bold text-[#0033A0]">{formatShortDate(d.deadline)}</div>
                    <div className="mt-0.5 text-[9px] font-medium text-[#94A3B8]">{d.owner}</div>
                  </div>
                </li>
              ))}
              {urgentDecisions.length === 0 && (
                <li className="text-[11px] font-medium text-[#94A3B8]">暂无待确认决策。</li>
              )}
            </ul>
            )}
          </ReportCard>
        </div>
      </section>

      <section>
        <SectionHeader index="05" title="执行结论与近期公告" english="Verdict & Upcoming Announcements" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <VerdictCard
              label="Project Status"
              value={isLoading ? '任务数据加载中…' : `${tasks.length} 项任务，已完成 ${done} 项`}
              subtitle="Live Collaboration Edition"
              todos={[
                '11/18 启动会与四人 RACI 签认',
                '11/24 案例征集公开首发（唯一必验节点）',
                '状态更新实时同步并自动留痕',
              ]}
            />
          </div>
          <ReportCard className="lg:col-span-8">
            <ReportCard.Header
              label="Announcements"
              title="近期发布公告"
              english="Next Scheduled Notices"
              action={
                <Link to="/notices" className="flex items-center gap-1 text-[11px] font-bold text-[#0033A0] hover:underline">
                  公告日历 <ArrowRight className="size-3" />
                </Link>
              }
            />
            {noticesLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i: number) => (
                  <div key={i} className="flex items-center gap-3 bp-hairline-b pb-2.5">
                    <Skeleton className="size-3.5 rounded-none" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-2/3 rounded-none" />
                      <Skeleton className="h-2.5 w-1/3 rounded-none" />
                    </div>
                    <Skeleton className="h-3 w-12 rounded-none" />
                  </div>
                ))}
              </div>
            ) : (
            <ul className="space-y-2.5">
              {nextNotices.map((n: ForumNotice) => (
                <li key={n.noticeId} className="flex items-center gap-3 bp-hairline-b pb-2.5">
                  <Megaphone className="size-3.5 shrink-0 text-[#0033A0]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-slate-800">{n.title}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#94A3B8]">{n.channel} · {n.owner}</p>
                  </div>
                  <Badge tone={n.scope === '对内' ? 'neutral' : n.scope === '对外定向' ? 'warning' : 'brand'}>
                    {n.scope}
                  </Badge>
                  <span className="tnum w-12 shrink-0 text-right text-[11px] font-bold text-slate-700">
                    {formatShortDate(n.publishDate)}
                  </span>
                </li>
              ))}
              {nextNotices.length === 0 && (
                <li className="text-[11px] font-medium text-[#94A3B8]">暂无近期公告。</li>
              )}
            </ul>
            )}
          </ReportCard>
        </div>
      </section>

      {isError && (
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#DC2626]">
          <AlertTriangle className="size-3.5" />
          部分实时协作数据暂不可用，请稍后重试；里程碑等静态内容仍可正常查看。
        </p>
      )}
    </div>
  );
};

export default DashboardPage;
