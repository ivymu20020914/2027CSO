/* 前后端共享的类型写在这里 */

// 任务协作状态：与前端 data/types.ts 的中文枚举保持一致，前后端统一从这里取值
export const TASK_STATUS_VALUES = [
  '未开始',
  '进行中',
  '已完成',
  '待审核',
  '已阻塞',
] as const;
export type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];
export const isTaskStatusValue = (v: string): v is TaskStatusValue =>
  (TASK_STATUS_VALUES as readonly string[]).includes(v);

// 任务优先级：与前端 data/types.ts 的 PRIORITIES 中文枚举保持一致
export const PRIORITY_VALUES = ['高', '中', '低'] as const;
export type PriorityValue = (typeof PRIORITY_VALUES)[number];
export const isPriorityValue = (v: string): v is PriorityValue =>
  (PRIORITY_VALUES as readonly string[]).includes(v);

// 后端任务 DTO：业务字段与前端 data/types.ts 的 Task 对齐（可空列统一回空字符串），
// 额外携带协作留痕字段 updatedAt / updatedBy
export interface ForumTaskDTO {
  taskId: string;
  moduleId: string;
  moduleSheet: string;
  stage: string;
  name: string;
  action: string;
  startDate: string;
  endDate: string;
  owner: string;
  status: string;
  collaborators: string;
  reviewer: string;
  deliverable: string;
  priority: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface ForumTaskListResponse {
  items: ForumTaskDTO[];
  total: number;
}

export interface UpdateTaskStatusRequest {
  status: string;
}

export interface UpdateTaskStatusResponse {
  task: ForumTaskDTO;
}

// 任务可编辑业务字段（taskId 由后端生成、留痕字段后端维护，均不在此列）
export interface TaskEditableFields {
  moduleId: string;
  moduleSheet: string;
  stage: string;
  name: string;
  action: string;
  startDate: string;
  endDate: string;
  owner: string;
  status: string;
  collaborators: string;
  reviewer: string;
  deliverable: string;
  priority: string;
}

export interface CreateTaskRequest extends TaskEditableFields {}

export interface CreateTaskResponse {
  task: ForumTaskDTO;
}

// PUT 全量更新：提交完整业务字段，后端整体覆盖
export interface UpdateTaskRequest extends TaskEditableFields {}

export interface UpdateTaskResponse {
  task: ForumTaskDTO;
}

export interface DeleteTaskResponse {
  taskId: string;
}

// 决策协作状态：与前端 data/types.ts 的 DECISION_STATUSES 中文枚举保持一致
export const DECISION_STATUS_VALUES = ['待确认', '已确认', '已关闭'] as const;
export type DecisionStatusValue = (typeof DECISION_STATUS_VALUES)[number];
export const isDecisionStatusValue = (v: string): v is DecisionStatusValue =>
  (DECISION_STATUS_VALUES as readonly string[]).includes(v);

// 后端决策 DTO：业务字段与前端 data/types.ts 的 Decision 对齐（可空列统一回空字符串），
// 额外携带协作留痕字段 updatedAt / updatedBy
export interface ForumDecisionDTO {
  decisionId: string;
  domain: string;
  question: string;
  deadline: string;
  owner: string;
  decider: string;
  impact: string;
  status: string;
  basis: string;
  conclusion: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface ForumDecisionListResponse {
  items: ForumDecisionDTO[];
  total: number;
}

export interface UpdateDecisionStatusRequest {
  status: string;
}

export interface UpdateDecisionStatusResponse {
  decision: ForumDecisionDTO;
}

// 后端公告 DTO：业务字段与前端 data/types.ts 的 Notice 对齐（可空列统一回空字符串），
// 公告状态复用任务五态 TASK_STATUS_VALUES，额外携带协作留痕字段 updatedAt / updatedBy
export interface ForumNoticeDTO {
  noticeId: string;
  scope: string;
  moduleId: string;
  moduleSheet: string;
  title: string;
  draftDate: string;
  approveDeadline: string;
  publishDate: string;
  frequency: string;
  audience: string;
  channel: string;
  keyMessage: string;
  owner: string;
  approver: string;
  requiredAction: string;
  status: string;
  confidentiality: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface ForumNoticeListResponse {
  items: ForumNoticeDTO[];
  total: number;
}

export interface UpdateNoticeStatusRequest {
  status: string;
}

export interface UpdateNoticeStatusResponse {
  notice: ForumNoticeDTO;
}

// 决策可编辑业务字段（decisionId 固定、留痕字段由后端维护，均不在此列）
export interface DecisionEditableFields {
  domain: string;
  question: string;
  deadline: string;
  owner: string;
  decider: string;
  impact: string;
  status: string;
  basis: string;
  conclusion: string;
}

export interface UpdateDecisionRequest extends DecisionEditableFields {}

export interface UpdateDecisionResponse {
  decision: ForumDecisionDTO;
}

export interface CreateDecisionRequest extends DecisionEditableFields {}

export interface CreateDecisionResponse {
  decision: ForumDecisionDTO;
}

export interface DeleteDecisionResponse {
  decisionId: string;
}

// 公告发布范围：与前端 data/types.ts 的 NOTICE_SCOPES 保持一致
export const NOTICE_SCOPE_VALUES = ['对内', '对外公开', '对外定向'] as const;
export type NoticeScopeValue = (typeof NOTICE_SCOPE_VALUES)[number];

// 公告可编辑业务字段（noticeId 固定、留痕字段由后端维护，均不在此列）
export interface NoticeEditableFields {
  scope: string;
  moduleId: string;
  moduleSheet: string;
  title: string;
  draftDate: string;
  approveDeadline: string;
  publishDate: string;
  frequency: string;
  audience: string;
  channel: string;
  keyMessage: string;
  owner: string;
  approver: string;
  requiredAction: string;
  status: string;
  confidentiality: string;
}

export interface UpdateNoticeRequest extends NoticeEditableFields {}

export interface UpdateNoticeResponse {
  notice: ForumNoticeDTO;
}

export interface CreateNoticeRequest extends NoticeEditableFields {}

export interface CreateNoticeResponse {
  notice: ForumNoticeDTO;
}

export interface DeleteNoticeResponse {
  noticeId: string;
}

// 可扩展选项：表单与筛选里的模块 / 主责 / 状态等都可以按需补充，
// 补充值统一存 forum_option 表，全团队共享
export const OPTION_CATEGORIES = [
  'module',
  'owner',
  'status',
  'priority',
  'notice_scope',
  'decision_status',
] as const;
export type OptionCategory = (typeof OPTION_CATEGORIES)[number];
export const isOptionCategory = (v: string): v is OptionCategory =>
  (OPTION_CATEGORIES as readonly string[]).includes(v);

export interface ForumOptionDTO {
  category: OptionCategory;
  value: string;
  code: string | null;
  sortOrder: number;
}

export interface ForumOptionListResponse {
  items: ForumOptionDTO[];
}

export interface CreateOptionRequest {
  category: OptionCategory;
  value: string;
}

export interface CreateOptionResponse {
  option: ForumOptionDTO;
}
