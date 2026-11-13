/* eslint-disable */
/** auto generated, do not edit */
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, uniqueIndex, uuid, varchar, customType } from "drizzle-orm/pg-core"

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number };
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number) {
    if (value == null) return value as any;
    if (typeof value === 'number') return new Date(value).toISOString();
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if (value instanceof Date) return value;
    return new Date(value);
  },
});

export const userProfile = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: string) {
    return sql`ROW(${value})::user_profile`;
  },
  fromDriver(value: string) {
    const [userId] = value.slice(1, -1).split(',');
    return userId.trim();
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: string;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: string): FileAttachment {
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});

export function escapeLiteral(str: string): string {
  return "'" + str.replace(/'/g, "''") + "'";
}

export const userProfileArray = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return 'user_profile[]';
  },
  toDriver(value: string[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::user_profile[]`;
    }
    const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
    return sql.raw(`ARRAY[${elements}]::user_profile[]`);
  },
  fromDriver(value: string): string[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => m.slice(1, -1).split(',')[0].trim());
  },
});

export const fileAttachmentArray = customType<{
  data: FileAttachment[];
  driverData: string;
}>({
  dataType() {
    return 'file_attachment[]';
  },
  toDriver(value: FileAttachment[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::file_attachment[]`;
    }
    const elements = value.map(f =>
      `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`
    ).join(',');
    return sql.raw(`ARRAY[${elements}]::file_attachment[]`);
  },
  fromDriver(value: string): FileAttachment[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => {
      const [bucketId, filePath] = m.slice(1, -1).split(',');
      return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    });
  },
});

export const forumOption = pgTable("forum_option", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: varchar("category", { length: 32 }).notNull(),
  value: varchar("value", { length: 128 }).notNull(),
  code: varchar("code", { length: 16 }).unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("uq_forum_option_category_value").on(table.category, table.value),
  uniqueIndex("uq_forum_option_code").on(table.code),
  index("idx_forum_option_category").on(table.category),
]);

export const forumNotice = pgTable("forum_notice", {
  id: uuid("id").primaryKey().defaultRandom(),
  noticeId: varchar("notice_id", { length: 16 }).notNull().unique(),
  scope: varchar("scope", { length: 32 }).notNull(),
  moduleId: varchar("module_id", { length: 16 }).notNull(),
  moduleSheet: varchar("module_sheet", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  draftDate: varchar("draft_date", { length: 10 }),
  approveDeadline: varchar("approve_deadline", { length: 10 }),
  publishDate: varchar("publish_date", { length: 10 }),
  frequency: varchar("frequency", { length: 255 }),
  audience: varchar("audience", { length: 255 }),
  channel: varchar("channel", { length: 255 }),
  keyMessage: text("key_message"),
  owner: varchar("owner", { length: 128 }).notNull(),
  approver: varchar("approver", { length: 128 }),
  requiredAction: text("required_action"),
  status: varchar("status", { length: 32 }).notNull(),
  confidentiality: text("confidentiality"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("uq_forum_notice_notice_id").on(table.noticeId),
  index("idx_forum_notice_module").on(table.moduleId),
  index("idx_forum_notice_scope").on(table.scope),
  index("idx_forum_notice_status").on(table.status),
  index("idx_forum_notice_publish_date").on(table.publishDate),
]);

export const forumDecision = pgTable("forum_decision", {
  id: uuid("id").primaryKey().defaultRandom(),
  decisionId: varchar("decision_id", { length: 16 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }).notNull(),
  question: text("question").notNull(),
  deadline: varchar("deadline", { length: 10 }),
  owner: varchar("owner", { length: 128 }).notNull(),
  decider: varchar("decider", { length: 128 }),
  impact: text("impact"),
  status: varchar("status", { length: 32 }).notNull(),
  basis: text("basis"),
  conclusion: text("conclusion"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("uq_forum_decision_decision_id").on(table.decisionId),
  index("idx_forum_decision_status").on(table.status),
  index("idx_forum_decision_deadline").on(table.deadline),
]);

export const forumTask = pgTable("forum_task", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: varchar("task_id", { length: 64 }).notNull().unique(),
  moduleId: varchar("module_id", { length: 16 }).notNull(),
  moduleSheet: varchar("module_sheet", { length: 255 }),
  stage: varchar("stage", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  action: text("action"),
  startDate: varchar("start_date", { length: 10 }),
  endDate: varchar("end_date", { length: 10 }),
  owner: varchar("owner", { length: 128 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  collaborators: varchar("collaborators", { length: 255 }),
  reviewer: varchar("reviewer", { length: 128 }),
  deliverable: text("deliverable"),
  priority: varchar("priority", { length: 16 }).notNull(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("uq_forum_task_task_id").on(table.taskId),
  index("idx_forum_task_module").on(table.moduleId),
  index("idx_forum_task_owner").on(table.owner),
  index("idx_forum_task_status").on(table.status),
  index("idx_forum_task_end_date").on(table.endDate),
]);

// table aliases
export const forumDecisionTable = forumDecision;
export const forumNoticeTable = forumNotice;
export const forumOptionTable = forumOption;
export const forumTaskTable = forumTask;
