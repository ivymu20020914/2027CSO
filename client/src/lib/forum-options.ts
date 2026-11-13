import { MODULES, TEAM } from '@client/src/data/selectors';
import {
  DECISION_STATUSES,
  NOTICE_SCOPES,
  PRIORITIES,
  TASK_STATUSES,
} from '@client/src/data/types';
import type { ModuleInfo } from '@client/src/data/types';
import type { ForumOptionDTO } from '@shared/api.interface';

export interface OptionGroups {
  modules: ModuleInfo[];
  owners: string[];
  statuses: string[];
  priorities: string[];
  noticeScopes: string[];
  decisionStatuses: string[];
}

function mergeValues(base: readonly string[], extra: string[]): string[] {
  const merged: string[] = [...base];
  for (const item of extra) {
    if (!merged.includes(item)) merged.push(item);
  }
  return merged;
}

function buildCustomModules(options: ForumOptionDTO[]): ModuleInfo[] {
  const modules: ModuleInfo[] = [];
  for (const option of options) {
    if (option.category !== 'module') continue;
    if (MODULES.some((m: ModuleInfo) => m.name === option.value)) continue;
    modules.push({
      moduleId: option.code ?? option.value,
      sheetName: option.value,
      name: option.value,
      owner: '未指派',
      total: 0,
      milestone: '该模块为补充新增，尚未配置里程碑。',
      remark: '在任务/公告录入时按需补充的模块。',
    });
  }
  return modules;
}

function valuesOf(
  options: ForumOptionDTO[],
  category: ForumOptionDTO['category'],
): string[] {
  return options
    .filter((option: ForumOptionDTO) => option.category === category)
    .map((option: ForumOptionDTO) => option.value);
}

export function buildOptionGroups(options: ForumOptionDTO[]): OptionGroups {
  return {
    modules: [...MODULES, ...buildCustomModules(options)],
    owners: mergeValues(
      TEAM.map((member) => member.name),
      valuesOf(options, 'owner'),
    ),
    statuses: mergeValues(TASK_STATUSES, valuesOf(options, 'status')),
    priorities: mergeValues(PRIORITIES, valuesOf(options, 'priority')),
    noticeScopes: mergeValues(
      NOTICE_SCOPES,
      valuesOf(options, 'notice_scope'),
    ),
    decisionStatuses: mergeValues(
      DECISION_STATUSES,
      valuesOf(options, 'decision_status'),
    ),
  };
}

export function findModule(
  modules: ModuleInfo[],
  moduleId: string,
): ModuleInfo | undefined {
  return modules.find((m: ModuleInfo) => m.moduleId === moduleId);
}
