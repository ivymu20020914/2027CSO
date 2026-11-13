import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Button } from '@client/src/components/ui/button';
import { useForumOptions } from '@client/src/hooks/useForumOptions';

export interface TaskFilterState {
  keyword: string;
  moduleId: string;
  owner: string;
  status: string;
  priority: string;
}

export const EMPTY_TASK_FILTER: TaskFilterState = {
  keyword: '',
  moduleId: 'all',
  owner: 'all',
  status: 'all',
  priority: 'all',
};

interface TaskFiltersProps {
  value: TaskFilterState;
  onChange: (next: TaskFilterState) => void;
  showModule?: boolean;
  resultCount: number;
}

const ALL = 'all';

const TaskFilters = ({ value, onChange, showModule = true, resultCount }: TaskFiltersProps) => {
  const { groups } = useForumOptions();
  const set = (patch: Partial<TaskFilterState>): void =>
    onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            value={value.keyword}
            onChange={(e) => set({ keyword: e.target.value })}
            placeholder="搜索任务名称 / 动作 / 交付物 / 负责人"
            className="h-9 rounded-none border-border pl-9 text-[12px] shadow-none focus-visible:ring-[#0033A0]"
          />
        </div>
        {showModule && (
          <Select value={value.moduleId} onValueChange={(v) => set({ moduleId: v })}>
            <SelectTrigger className="h-9 rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]">
              <SelectValue placeholder="全部模块" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value={ALL}>全部模块</SelectItem>
              {groups.modules.map((m) => (
                <SelectItem key={m.moduleId} value={m.moduleId}>
                  {m.moduleId} · {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={value.owner} onValueChange={(v) => set({ owner: v })}>
          <SelectTrigger className="h-9 rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]">
            <SelectValue placeholder="全部主责" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value={ALL}>全部主责</SelectItem>
            {groups.owners.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Select value={value.status} onValueChange={(v) => set({ status: v })}>
            <SelectTrigger className="h-9 rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value={ALL}>全部状态</SelectItem>
              {groups.statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={value.priority} onValueChange={(v) => set({ priority: v })}>
            <SelectTrigger className="h-9 rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value={ALL}>全部优先级</SelectItem>
              {groups.priorities.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}优先
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#94A3B8]">
          匹配 <span className="tnum text-[#0033A0]">{resultCount}</span> 项任务
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_TASK_FILTER)}
          className="h-7 rounded-none text-[11px] font-bold text-[#0033A0] hover:bg-[#CCE0FF]/40"
        >
          <RotateCcw className="size-3" />
          清除筛选
        </Button>
      </div>
    </div>
  );
};

export { TaskFilters };
