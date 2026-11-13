// 蓝图数据层类型与状态常量（由 Excel 生成脚本产出，请勿手改数据内容）

export const TASK_STATUSES = ['未开始', '进行中', '已完成', '待审核', '已阻塞'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PRIORITIES = ['高', '中', '低'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const NOTICE_SCOPES = ['对内', '对外公开', '对外定向'] as const;
export type NoticeScope = (typeof NOTICE_SCOPES)[number];

export const DECISION_STATUSES = ['待确认', '已确认', '已关闭'] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export interface ModuleInfo {
  moduleId: string;
  sheetName: string;
  name: string;
  owner: string;
  total: number;
  milestone: string;
  remark: string;
}

export interface TeamMember {
  name: string;
  role: string;
  core: string;
  work: string;
  approval: string;
  notDo: string;
  taskCount: number;
  note: string;
}

export interface Milestone {
  date: string;
  name: string;
  nature: string;
  requirement: string;
}

export interface ProjectMeta {
  name: string;
  theme: string;
  organizer: string;
  host: string;
  location: string;
  startDate: string;
  forumDate: string;
  commsEndDate: string;
  leaders: { label: string; name: string }[];
  totals: {
    tasks: number;
    notices: number;
    decisions: number;
    modules: number;
    team: number;
  };
}

export interface Task {
  taskId: string;
  moduleId: string;
  moduleSheet: string;
  stage: string;
  name: string;
  action: string;
  startDate: string;
  endDate: string;
  owner: string;
  status: TaskStatus;
  collaborators: string;
  reviewer: string;
  deliverable: string;
  priority: Priority;
}

export interface Notice {
  noticeId: string;
  scope: NoticeScope;
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
  status: TaskStatus;
  confidentiality: string;
}

export interface Decision {
  decisionId: string;
  domain: string;
  question: string;
  deadline: string;
  owner: string;
  decider: string;
  impact: string;
  status: DecisionStatus;
  basis: string;
  conclusion: string;
}
