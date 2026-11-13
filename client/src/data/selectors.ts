import dayjs from 'dayjs';
import { MODULES, MILESTONES, TEAM } from './project';
import type {
  ModuleInfo,
  TaskStatus,
  Priority,
  NoticeScope,
} from './types';

interface TaskLike {
  taskId: string;
  moduleId: string;
  owner: string;
  status: string;
  priority: string;
  name: string;
  action: string;
  stage: string;
  deliverable: string;
  collaborators: string;
}

export const MODULE_MAP: Map<string, ModuleInfo> = new Map(
  MODULES.map((m: ModuleInfo): [string, ModuleInfo] => [m.moduleId, m]),
);

export function getModule(moduleId: string): ModuleInfo | undefined {
  return MODULE_MAP.get(moduleId);
}

export function getModuleName(moduleId: string): string {
  return MODULE_MAP.get(moduleId)?.name ?? moduleId;
}

export interface StatusCount {
  status: TaskStatus;
  count: number;
}

export function taskStatusStats<T extends { status: string }>(
  tasks: T[],
): StatusCount[] {
  const order: TaskStatus[] = ['未开始', '进行中', '已完成', '待审核', '已阻塞'];
  return order.map((status: TaskStatus): StatusCount => ({
    status,
    count: tasks.filter((t: T): boolean => t.status === status).length,
  }));
}

export interface ModuleStat {
  module: ModuleInfo;
  total: number;
  notStarted: number;
  inProgress: number;
  done: number;
  review: number;
  blocked: number;
  high: number;
}

export function moduleStats<
  T extends { moduleId: string; status: string; priority: string },
>(tasks: T[], extraModules: ModuleInfo[] = []): ModuleStat[] {
  const seen: Set<string> = new Set();
  const modules: ModuleInfo[] = [];
  for (const item of [...MODULES, ...extraModules]) {
    if (seen.has(item.moduleId)) continue;
    seen.add(item.moduleId);
    modules.push(item);
  }
  return modules.map((module: ModuleInfo): ModuleStat => {
    const list: T[] = tasks.filter(
      (t: T): boolean => t.moduleId === module.moduleId,
    );
    const count = (status: TaskStatus): number =>
      list.filter((t: T): boolean => t.status === status).length;
    return {
      module,
      total: list.length,
      notStarted: count('未开始'),
      inProgress: count('进行中'),
      done: count('已完成'),
      review: count('待审核'),
      blocked: count('已阻塞'),
      high: list.filter((t: T): boolean => t.priority === '高').length,
    };
  });
}

export interface OwnerStat {
  owner: string;
  total: number;
  high: number;
}

export function ownerStats<
  T extends { owner: string; priority: string },
>(tasks: T[]): OwnerStat[] {
  const names: string[] = TEAM.map((m) => m.name);
  return names
    .map((owner: string): OwnerStat => {
      const list: T[] = tasks.filter((t: T): boolean => t.owner === owner);
      return {
        owner,
        total: list.length,
        high: list.filter((t: T): boolean => t.priority === '高').length,
      };
    })
    .filter((o: OwnerStat): boolean => o.total > 0);
}

export interface PriorityCount {
  priority: Priority;
  count: number;
}

export function priorityStats<T extends { priority: string }>(
  tasks: T[],
): PriorityCount[] {
  const order: Priority[] = ['高', '中', '低'];
  return order
    .map((priority: Priority): PriorityCount => ({
      priority,
      count: tasks.filter((t: T): boolean => t.priority === priority).length,
    }))
    .filter((p: PriorityCount): boolean => p.count > 0);
}

export interface NoticeScopeCount {
  scope: NoticeScope;
  count: number;
}

export function noticeScopeStats<T extends { scope: string }>(
  notices: T[],
): NoticeScopeCount[] {
  const order: NoticeScope[] = ['对内', '对外公开', '对外定向'];
  return order.map((scope: NoticeScope): NoticeScopeCount => ({
    scope,
    count: notices.filter((n: T): boolean => n.scope === scope).length,
  }));
}

export interface TaskFilter {
  keyword?: string;
  moduleId?: string;
  owner?: string;
  status?: string;
  priority?: string;
}

export function filterTasks<T extends TaskLike>(
  tasks: T[],
  filter: TaskFilter,
): T[] {
  const kw: string = (filter.keyword ?? '').trim().toLowerCase();
  return tasks.filter((t: T): boolean => {
    if (filter.moduleId && t.moduleId !== filter.moduleId) return false;
    if (filter.owner && t.owner !== filter.owner) return false;
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (kw) {
      const haystack: string = [
        t.taskId,
        t.name,
        t.action,
        t.stage,
        t.deliverable,
        t.owner,
        t.collaborators,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(kw)) return false;
    }
    return true;
  });
}

export function sortTasksByDate<T extends { endDate: string }>(
  list: T[],
): T[] {
  return [...list].sort((a: T, b: T): number =>
    a.endDate.localeCompare(b.endDate),
  );
}

export function upcomingMilestones(limit: number): typeof MILESTONES {
  const today: string = dayjs().format('YYYY-MM-DD');
  const future = MILESTONES.filter((m): boolean => m.date >= today);
  return (future.length > 0 ? future : MILESTONES).slice(0, limit);
}

export function decisionsByDomain<T extends { domain: string }>(
  decisions: T[],
): Map<string, T[]> {
  const map: Map<string, T[]> = new Map();
  decisions.forEach((d: T): void => {
    const list: T[] = map.get(d.domain) ?? [];
    list.push(d);
    map.set(d.domain, list);
  });
  return map;
}

export function noticesByModule<T extends { moduleId: string }>(
  list: T[],
  moduleId: string,
): T[] {
  return list.filter((n: T): boolean => n.moduleId === moduleId);
}

export function tasksByModule<T extends { moduleId: string }>(
  tasks: T[],
  moduleId: string,
): T[] {
  return tasks.filter((t: T): boolean => t.moduleId === moduleId);
}

export function formatDate(date: string): string {
  if (!date) return '';
  return dayjs(date).format('YYYY/MM/DD');
}

export function formatShortDate(date: string): string {
  if (!date) return '';
  return dayjs(date).format('MM/DD');
}

export function daysUntil(date: string): number {
  return dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day');
}

export { MODULES, MILESTONES, TEAM };
