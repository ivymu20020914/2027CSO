import { useState } from 'react';
import { DataTable, type TableColumn } from '@client/src/components/blueprint/DataTable';
import {
  TaskStatusBadge,
  PriorityBadge,
} from '@client/src/components/blueprint/StatusBadge';
import { TaskDetailDialog } from './TaskDetailDialog';
import { getModuleName, formatShortDate } from '@client/src/data/selectors';
import type { ForumTask } from '@client/src/api/forum-task';

interface TaskTableProps {
  tasks: ForumTask[];
  showModule?: boolean;
  empty?: React.ReactNode;
}

const TaskTable = ({ tasks, showModule = true, empty }: TaskTableProps) => {
  const [selected, setSelected] = useState<ForumTask | null>(null);

  const columns: TableColumn<ForumTask>[] = [
    {
      key: 'taskId',
      header: '任务ID',
      mono: true,
      className: 'whitespace-nowrap',
      render: (row) => <span className="text-[10px] font-bold text-[#94A3B8]">{row.taskId}</span>,
    },
    {
      key: 'name',
      header: '任务名称',
      primary: true,
      className: 'min-w-[200px]',
      render: (row) => (
        <div>
          <div className="text-xs font-bold text-[#0033A0]">{row.name}</div>
          <div className="mt-0.5 line-clamp-1 text-[10px] font-medium text-[#94A3B8]">{row.stage}</div>
        </div>
      ),
    },
    ...(showModule
      ? [
          {
            key: 'moduleId',
            header: '所属模块',
            className: 'whitespace-nowrap',
            render: (row: ForumTask) => (
              <span className="text-[11px] font-medium text-slate-600">
                {getModuleName(row.moduleId)}
              </span>
            ),
          } as TableColumn<ForumTask>,
        ]
      : []),
    {
      key: 'owner',
      header: '主责',
      className: 'whitespace-nowrap',
      render: (row) => <span className="text-[11px] font-bold text-slate-700">{row.owner}</span>,
    },
    {
      key: 'endDate',
      header: '完成节点',
      align: 'right',
      mono: true,
      className: 'whitespace-nowrap',
      render: (row) => formatShortDate(row.endDate),
    },
    {
      key: 'priority',
      header: '优先级',
      align: 'center',
      className: 'whitespace-nowrap',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: 'status',
      header: '状态',
      align: 'center',
      className: 'whitespace-nowrap',
      render: (row) => <TaskStatusBadge status={row.status} />,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={tasks}
        rowKey={(row) => row.taskId}
        onRowClick={(row) => setSelected(row)}
        empty={empty}
      />
      <TaskDetailDialog task={selected} open={selected !== null} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
};

export { TaskTable };
