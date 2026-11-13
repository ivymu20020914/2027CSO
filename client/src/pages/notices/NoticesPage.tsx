import { useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { ReportCard } from '@client/src/components/blueprint/ReportCard';
import { SectionHeader } from '@client/src/components/blueprint/SectionHeader';
import { KpiCard, KpiRow } from '@client/src/components/blueprint/KpiCard';
import { EmptyState } from '@client/src/components/blueprint/EmptyState';
import { NoticeTable } from '@client/src/components/notice/NoticeTable';
import { NoticeFormDialog } from '@client/src/components/notice/NoticeFormDialog';
import { noticeScopeStats } from '@client/src/data/selectors';
import type { ModuleInfo } from '@client/src/data/types';
import { useForumOptions } from '@client/src/hooks/useForumOptions';
import { useForumNotices } from '@client/src/hooks/useForumNotices';
import { getApiErrorMessage } from '@client/src/lib/api-error';

const NoticeTableSkeleton = () => (
  <div className="space-y-2 p-2">
    {Array.from({ length: 6 }).map((_, i: number) => (
      <div key={i} className="flex items-center gap-4 border-b border-border pb-3">
        <Skeleton className="h-3 w-12 rounded-none" />
        <Skeleton className="h-4 flex-1 rounded-none" />
        <Skeleton className="h-3 w-16 rounded-none" />
        <Skeleton className="h-3 w-16 rounded-none" />
      </div>
    ))}
  </div>
);

const NoticesPage = () => {
  const [scope, setScope] = useState<string>('all');
  const [moduleId, setModuleId] = useState<string>('all');
  const [keyword, setKeyword] = useState<string>('');
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const { notices, isLoading, isError, error, refetch } = useForumNotices();
  const { groups } = useForumOptions();

  const scopeStats = useMemo(() => noticeScopeStats(notices), [notices]);
  const inProgressCount: number = useMemo(
    () => notices.filter((n) => n.status === '进行中').length,
    [notices],
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return notices
      .filter((n) => {
        if (scope !== 'all' && n.scope !== scope) return false;
        if (moduleId !== 'all' && n.moduleId !== moduleId) return false;
        if (kw) {
          const hay = [n.title, n.keyMessage, n.channel, n.owner, n.audience]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(kw)) return false;
        }
        return true;
      })
      .sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  }, [scope, moduleId, keyword, notices]);

  return (
    <div className="rise space-y-6">
      <SectionHeader index="04" title="通知公告日历" english="Announcement Calendar · 59 Notices" />

      <ReportCard className="!p-0">
        <KpiRow>
          <KpiCard label="通知总数" value={isLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : notices.length} />
          {scopeStats.map((s) => (
            <KpiCard
              key={s.scope}
              label={s.scope}
              value={isLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : s.count}
            />
          ))}
          <KpiCard
            label="进行中"
            value={isLoading ? <Skeleton className="h-6 w-10 rounded-none" /> : inProgressCount}
            aux="协作状态实时更新"
          />
        </KpiRow>
      </ReportCard>

      <ReportCard>
        <ReportCard.Header
          label="Filter"
          title="公告检索"
          english="Filter by scope / module"
          action={
            <Button writeAction
              size="sm"
              className="rounded-none bg-[#0033A0] text-white hover:bg-[#00247D]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-3.5" />
              新增公告
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索标题 / 口径 / 渠道"
              className="h-9 rounded-none border-border pl-9 text-[12px] shadow-none focus-visible:ring-[#0033A0]"
            />
          </div>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="h-9 rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]">
              <SelectValue placeholder="发布范围" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">全部范围</SelectItem>
              {groups.noticeScopes.map((s: string) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={moduleId} onValueChange={setModuleId}>
            <SelectTrigger className="h-9 rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]">
              <SelectValue placeholder="关联专项" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">全部专项</SelectItem>
              {groups.modules.map((m: ModuleInfo) => (
                <SelectItem key={m.moduleId} value={m.moduleId}>
                  {m.moduleId} · {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-3 text-[11px] font-bold text-[#94A3B8]">
          匹配 <span className="tnum text-[#0033A0]">{filtered.length}</span> 条公告
        </p>
      </ReportCard>

      <ReportCard className="!p-2">
        {isLoading ? (
          <NoticeTableSkeleton />
        ) : isError ? (
          <EmptyState
            title="公告数据加载失败"
            description={getApiErrorMessage(error, '无法连接公告数据，请稍后重试。')}
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
        ) : (
          <NoticeTable
            notices={filtered}
            empty={<EmptyState title="没有匹配的公告" description="请调整关键词、发布范围或关联专项。" />}
          />
        )}
      </ReportCard>
      <p className="text-[10px] font-medium text-[#94A3B8]">
        通知公告共 {notices.length} 条，点击任意行查看明细。登录后可新增、编辑、删除及更新状态，保存后多设备同步。
      </p>

      <NoticeFormDialog
        open={createOpen}
        notice={null}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
};

export default NoticesPage;
