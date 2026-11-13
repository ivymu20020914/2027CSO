import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { ReportCard } from '@client/src/components/blueprint/ReportCard';
import { SectionHeader } from '@client/src/components/blueprint/SectionHeader';
import { EmptyState } from '@client/src/components/blueprint/EmptyState';
import {
  TaskFilters,
  EMPTY_TASK_FILTER,
  type TaskFilterState,
} from '@client/src/components/task/TaskFilters';
import { TaskTable } from '@client/src/components/task/TaskTable';
import { TaskTableSkeleton } from '@client/src/components/task/TaskTableSkeleton';
import { TaskFormDialog } from '@client/src/components/task/TaskFormDialog';
import { filterTasks } from '@client/src/data/selectors';
import { useForumTasks } from '@client/src/hooks/useForumTasks';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import { Button } from '@client/src/components/ui/button';
import type { TaskStatus, Priority } from '@client/src/data/types';

const TasksPage = () => {
  const [filter, setFilter] = useState<TaskFilterState>(EMPTY_TASK_FILTER);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const { tasks, isLoading, isError, error, refetch } = useForumTasks();

  const filtered = useMemo(() => {
    return filterTasks(tasks, {
      keyword: filter.keyword,
      moduleId: filter.moduleId === 'all' ? undefined : filter.moduleId,
      owner: filter.owner === 'all' ? undefined : filter.owner,
      status:
        filter.status === 'all'
          ? undefined
          : (filter.status as TaskStatus),
      priority:
        filter.priority === 'all'
          ? undefined
          : (filter.priority as Priority),
    });
  }, [filter, tasks]);

  return (
    <div className="rise space-y-6">
      <SectionHeader
        index="02"
        title="全量任务中心"
        english="Master Task Index · 322 Actions"
      />
      <ReportCard>
        <ReportCard.Header
          label="Filter & Search"
          title="任务检索"
          english="Search across all workstreams"
          action={
            <Button writeAction
              size="sm"
              className="rounded-none bg-[#0033A0] text-white hover:bg-[#00247D]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-3.5" />
              新增任务
            </Button>
          }
        />
        <TaskFilters
          value={filter}
          onChange={setFilter}
          resultCount={filtered.length}
        />
      </ReportCard>
      <ReportCard className="!p-2">
        {isLoading ? (
          <TaskTableSkeleton />
        ) : isError ? (
          <EmptyState
            title="任务数据加载失败"
            description={getApiErrorMessage(error, '无法连接任务数据，请稍后重试。')}
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
          <TaskTable
            tasks={filtered}
            empty={
              <EmptyState
                title="没有匹配的任务"
                description="当前筛选条件下没有任务，请调整关键词或清除筛选条件。"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border-[#0033A0] text-[#0033A0]"
                    onClick={() => setFilter(EMPTY_TASK_FILTER)}
                  >
                    清除筛选
                  </Button>
                }
              />
            }
          />
        )}
      </ReportCard>
      <p className="text-[10px] font-medium text-[#94A3B8]">
        全量任务共 {tasks.length} 项，点击任意行查看明细。登录后可新增、编辑、删除及更新状态，保存后多设备同步。
      </p>

      <TaskFormDialog
        open={createOpen}
        mode="create"
        task={null}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
};

export default TasksPage;
