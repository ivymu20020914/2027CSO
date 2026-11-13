import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { ReportCard } from '@client/src/components/blueprint/ReportCard';
import { SectionHeader } from '@client/src/components/blueprint/SectionHeader';
import { KpiCard, KpiRow } from '@client/src/components/blueprint/KpiCard';
import { EmptyState } from '@client/src/components/blueprint/EmptyState';
import { Badge, ScopeBadge } from '@client/src/components/blueprint/StatusBadge';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import { TaskTable } from '@client/src/components/task/TaskTable';
import { TaskTableSkeleton } from '@client/src/components/task/TaskTableSkeleton';
import {
  getModule,
  tasksByModule,
  noticesByModule,
  formatShortDate,
} from '@client/src/data/selectors';
import { useForumTasks } from '@client/src/hooks/useForumTasks';
import { useForumNotices } from '@client/src/hooks/useForumNotices';
import type { ForumNotice } from '@client/src/hooks/useForumNotices';
import { useForumOptions } from '@client/src/hooks/useForumOptions';
import { findModule } from '@client/src/lib/forum-options';
import { getApiErrorMessage } from '@client/src/lib/api-error';

const ModuleDetailPage = () => {
  const { moduleId = '' } = useParams();
  const staticModule = getModule(moduleId);
  const { tasks, isLoading, isError, error, refetch } = useForumTasks();
  const { notices: allNotices, isLoading: noticesLoading } = useForumNotices();
  const { groups, isLoading: optionsLoading } = useForumOptions();
  const moduleInfo = staticModule ?? findModule(groups.modules, moduleId);

  const moduleTasks = useMemo(
    () => tasksByModule(tasks, moduleId),
    [tasks, moduleId],
  );
  const notices: ForumNotice[] = useMemo(
    () => noticesByModule(allNotices, moduleId),
    [allNotices, moduleId],
  );
  const highCount: number = useMemo(
    () => moduleTasks.filter((t) => t.priority === '高').length,
    [moduleTasks],
  );
  const inProgress: number = useMemo(
    () => moduleTasks.filter((t) => t.status === '进行中').length,
    [moduleTasks],
  );
  const done: number = useMemo(
    () => moduleTasks.filter((t) => t.status === '已完成').length,
    [moduleTasks],
  );

  if (!moduleInfo) {
    if (optionsLoading) {
      return (
        <div className="rise space-y-6">
          <Skeleton className="h-3 w-24 rounded-none" />
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-20 rounded-none" />
            <Skeleton className="h-7 w-56 rounded-none" />
            <Skeleton className="h-2.5 w-32 rounded-none" />
          </div>
          <ReportCard className="!p-0">
            <KpiRow>
              {['任务总数', '高优先级', '模块主责', '关联公告', '已完成 / 进行中'].map(
                (label: string) => (
                  <KpiCard
                    key={label}
                    label={label}
                    value={<Skeleton className="h-6 w-10 rounded-none" />}
                  />
                ),
              )}
            </KpiRow>
          </ReportCard>
          <ReportCard className="!p-2">
            <TaskTableSkeleton showModule={false} />
          </ReportCard>
        </div>
      );
    }
    return (
      <EmptyState
        title="未找到该执行模块"
        description="模块编号不存在或已调整，请返回任务中心选择有效模块。"
        action={
          <Link to="/tasks" className="text-[12px] font-bold text-[#0033A0] hover:underline">
            返回任务中心
          </Link>
        }
      />
    );
  }

  const dynamicValue = (v: number): React.ReactNode =>
    isLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : v;

  return (
    <div className="rise space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0033A0] hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        返回总览看板
      </Link>

      <div>
        <div className="bp-label mb-1">
          {moduleInfo.moduleId}. WORKSTREAM
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          {moduleInfo.name}
        </h1>
        <p className="bp-sublabel mt-1">{moduleInfo.sheetName}</p>
      </div>

      <ReportCard className="!p-0">
        <KpiRow>
          <KpiCard label="任务总数" value={dynamicValue(moduleTasks.length)} />
          <KpiCard label="高优先级" value={dynamicValue(highCount)} badge={<Badge tone="danger">高</Badge>} />
          <KpiCard label="模块主责" value={moduleInfo.owner} />
          <KpiCard label="关联公告" value={noticesLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : notices.length} />
          <KpiCard
            label="已完成 / 进行中"
            value={isLoading ? <Skeleton className="h-6 w-14 rounded-none" /> : `${done} / ${inProgress}`}
            badge={<Badge tone="brand">实时</Badge>}
          />
        </KpiRow>
      </ReportCard>

      <ReportCard>
        <ReportCard.Header label="Milestone" title="关键里程碑" english="Critical Path" />
        <p className="text-[12px] font-medium leading-relaxed text-slate-600">
          {moduleInfo.milestone}
        </p>
        <p className="mt-2 text-[11px] font-medium text-[#94A3B8]">{moduleInfo.remark}</p>
      </ReportCard>

      <section>
        <SectionHeader index="01" title="模块任务台账" english={`${moduleTasks.length} Tasks in This Workstream`} />
        <ReportCard className="!p-2">
          {isLoading ? (
            <TaskTableSkeleton showModule={false} />
          ) : isError ? (
            <EmptyState
              title="任务数据加载失败"
              description={getApiErrorMessage(error, '无法获取本模块任务，请稍后重试。')}
              action={<Button variant="outline" size="sm" className="rounded-none border-[#0033A0] text-[#0033A0]" onClick={() => refetch()}>重新加载</Button>}
            />
          ) : (
            <TaskTable tasks={moduleTasks} showModule={false} />
          )}
        </ReportCard>
      </section>

      <section>
        <SectionHeader index="02" title="关联通知公告" english={`${notices.length} Linked Notices`} />
        <ReportCard>
          {noticesLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i: number) => (
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
          ) : notices.length === 0 ? (
            <EmptyState title="该模块暂无关联公告" description="通知公告日历中没有挂接到本模块的记录。" />
          ) : (
            <ul className="space-y-2.5">
              {notices.map((n: ForumNotice) => (
                <li key={n.noticeId} className="flex items-center gap-3 bp-hairline-b pb-2.5 last:border-b-0">
                  <Megaphone className="size-3.5 shrink-0 text-[#0033A0]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-slate-800">{n.title}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#94A3B8]">
                      {n.channel} · 主责 {n.owner}
                    </p>
                  </div>
                  <ScopeBadge scope={n.scope} />
                  <span className="tnum w-12 shrink-0 text-right text-[11px] font-bold text-slate-700">
                    {formatShortDate(n.publishDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ReportCard>
      </section>
    </div>
  );
};

export default ModuleDetailPage;
