import { useState } from 'react';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { DataTable, type TableColumn } from '@client/src/components/blueprint/DataTable';
import {
  ScopeBadge,
  TaskStatusBadge,
} from '@client/src/components/blueprint/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { getModuleName, formatDate } from '@client/src/data/selectors';
import { NoticeStatusEditor } from './NoticeStatusEditor';
import { NoticeFormDialog } from './NoticeFormDialog';
import { NoticeDeleteDialog } from './NoticeDeleteDialog';
import type { ForumNotice } from '@client/src/api/forum-notice';

interface NoticeTableProps {
  notices: ForumNotice[];
  empty?: React.ReactNode;
}

const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-1 bp-hairline-b py-3 md:grid-cols-[120px_1fr] md:gap-4">
    <div className="bp-kpi-label pt-0.5">{label}</div>
    <div className="text-[12px] font-medium leading-relaxed text-slate-700">{children}</div>
  </div>
);

const NoticeTable = ({ notices, empty }: NoticeTableProps) => {
  const [selected, setSelected] = useState<ForumNotice | null>(null);
  const [editing, setEditing] = useState<ForumNotice | null>(null);
  const [deleting, setDeleting] = useState<ForumNotice | null>(null);

  const handleDeleted = (): void => {
    if (selected && deleting && selected.noticeId === deleting.noticeId) {
      setSelected(null);
    }
    setDeleting(null);
  };

  const columns: TableColumn<ForumNotice>[] = [
    {
      key: 'noticeId',
      header: '通知ID',
      mono: true,
      className: 'whitespace-nowrap',
      render: (row) => <span className="text-[10px] font-bold text-[#94A3B8]">{row.noticeId}</span>,
    },
    {
      key: 'title',
      header: '通知/公告标题',
      primary: true,
      className: 'min-w-[220px]',
      render: (row) => (
        <div>
          <div className="text-xs font-bold text-[#0033A0]">{row.title}</div>
          <div className="mt-0.5 line-clamp-1 text-[10px] font-medium text-[#94A3B8]">
            {getModuleName(row.moduleId) || row.moduleSheet}
          </div>
        </div>
      ),
    },
    {
      key: 'scope',
      header: '发布范围',
      align: 'center',
      className: 'whitespace-nowrap',
      render: (row) => <ScopeBadge scope={row.scope} />,
    },
    {
      key: 'status',
      header: '协作状态',
      align: 'center',
      className: 'whitespace-nowrap',
      render: (row) => <TaskStatusBadge status={row.status} />,
    },
    {
      key: 'channel',
      header: '发布渠道',
      className: 'whitespace-nowrap',
      render: (row) => <span className="text-[11px] font-medium text-slate-600">{row.channel}</span>,
    },
    {
      key: 'owner',
      header: '主责',
      className: 'whitespace-nowrap',
      render: (row) => <span className="text-[11px] font-bold text-slate-700">{row.owner}</span>,
    },
    {
      key: 'approver',
      header: '审批人',
      className: 'whitespace-nowrap',
      render: (row) => <span className="text-[11px] font-medium text-slate-600">{row.approver}</span>,
    },
    {
      key: 'publishDate',
      header: '正式发布',
      align: 'right',
      mono: true,
      className: 'whitespace-nowrap',
      render: (row) => formatDate(row.publishDate),
    },
    {
      key: 'action',
      header: '操作',
      align: 'center',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button writeAction
            variant="outline"
            size="sm"
            className="h-7 gap-1 rounded-none border-[#0033A0] px-2.5 text-[11px] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
            aria-label={`编辑公告 ${row.noticeId} 内容`}
            onClick={(e) => {
              e.stopPropagation();
              setEditing(row);
            }}
          >
            <Pencil className="size-3" />
            编辑
          </Button>
          <Button writeAction
            variant="outline"
            size="sm"
            className="h-7 gap-1 rounded-none border-border px-2.5 text-[11px] text-slate-600 hover:bg-slate-100"
            aria-label={`更新公告 ${row.noticeId} 状态`}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(row);
            }}
          >
            <RefreshCw className="size-3" />
            状态
          </Button>
          <Button writeAction
            variant="outline"
            size="sm"
            className="h-7 gap-1 rounded-none border-[#DC2626] px-2.5 text-[11px] text-[#DC2626] hover:bg-[#DC2626] hover:text-white"
            aria-label={`删除公告 ${row.noticeId}`}
            onClick={(e) => {
              e.stopPropagation();
              setDeleting(row);
            }}
          >
            <Trash2 className="size-3" />
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={notices}
        rowKey={(row) => row.noticeId}
        onRowClick={(row) => setSelected(row)}
        empty={empty}
      />
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="rounded-none border-t-[3px] border-t-[#0033A0] p-0 sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader className="border-b border-border p-6 pb-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="tnum text-[11px] font-bold text-[#94A3B8]">{selected.noticeId}</span>
                  <ScopeBadge scope={selected.scope} />
                  <TaskStatusBadge status={selected.status} />
                </div>
                <DialogTitle className="text-base font-extrabold text-slate-900">
                  {selected.title}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap items-center justify-end gap-2 px-6 pt-3">
                <Button writeAction
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded-none border-[#0033A0] px-2.5 text-[11px] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
                  onClick={() => {
                    setSelected(null);
                    setEditing(selected);
                  }}
                >
                  <Pencil className="size-3" />
                  编辑内容
                </Button>
                <Button writeAction
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded-none border-[#DC2626] px-2.5 text-[11px] text-[#DC2626] hover:bg-[#DC2626] hover:text-white"
                  aria-label={`删除公告 ${selected.noticeId}`}
                  onClick={() => setDeleting(selected)}
                >
                  <Trash2 className="size-3" />
                  删除
                </Button>
              </div>
              <div className="max-h-[55vh] overflow-y-auto px-6 py-2">
                <FieldRow label="发布对象">{selected.audience || '—'}</FieldRow>
                <FieldRow label="发布渠道">{selected.channel || '—'}</FieldRow>
                <FieldRow label="发布周期">{selected.frequency || '—'}</FieldRow>
                <FieldRow label="核心口径">{selected.keyMessage || '—'}</FieldRow>
                <FieldRow label="要求动作">{selected.requiredAction || '—'}</FieldRow>
                <FieldRow label="时间节点">
                  <span className="tnum">
                    初稿 {formatDate(selected.draftDate)} ｜ 审批最晚 {formatDate(selected.approveDeadline)} ｜ 发布{' '}
                    {formatDate(selected.publishDate)}
                  </span>
                </FieldRow>
                <FieldRow label="主责/审批">
                  {selected.owner} ｜ {selected.approver}
                </FieldRow>
                {selected.confidentiality && (
                  <FieldRow label="约束/保密">{selected.confidentiality}</FieldRow>
                )}
              </div>
              <NoticeStatusEditor notice={selected} />
            </>
          )}
        </DialogContent>
      </Dialog>
      <NoticeFormDialog
        notice={editing}
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      />
      <NoticeDeleteDialog
        notice={deleting}
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        onDeleted={handleDeleted}
      />
    </>
  );
};

export { NoticeTable };
