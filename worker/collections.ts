import { TASKS } from '../client/src/data/tasks.ts';
import { NOTICES } from '../client/src/data/notices.ts';
import { DECISIONS } from '../client/src/data/decisions.ts';
import { ApiError, json, readBody, text } from './platform.ts';
import type { Environment, Member } from './platform.ts';

const definitions = {
  'forum-tasks': { table: 'forum_task', key: 'taskId', result: 'task', prefix: 'N', digits: 3, source: TASKS, required: ['moduleId', 'name', 'owner', 'status', 'priority'], fields: ['moduleId', 'moduleSheet', 'stage', 'name', 'action', 'startDate', 'endDate', 'owner', 'status', 'collaborators', 'reviewer', 'deliverable', 'priority'] },
  'forum-notices': { table: 'forum_notice', key: 'noticeId', result: 'notice', prefix: 'N', digits: 3, source: NOTICES, required: ['scope', 'title', 'owner', 'status'], fields: ['scope', 'moduleId', 'moduleSheet', 'title', 'draftDate', 'approveDeadline', 'publishDate', 'frequency', 'audience', 'channel', 'keyMessage', 'owner', 'approver', 'requiredAction', 'status', 'confidentiality'] },
  'forum-decisions': { table: 'forum_decision', key: 'decisionId', result: 'decision', prefix: 'D', digits: 2, source: DECISIONS, required: ['domain', 'question', 'owner', 'status'], fields: ['domain', 'question', 'deadline', 'owner', 'decider', 'impact', 'status', 'basis', 'conclusion'] },
} as const;

interface Row { id: string; data: string; updated_at: string; updated_by: string | null }

function present(row: Row, key: string) {
  return { ...JSON.parse(row.data), [key]: row.id, updatedAt: row.updated_at, updatedBy: null };
}

function validateDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

function editable(body: Record<string, unknown>, fields: readonly string[], required: readonly string[]): Record<string, string> {
  const data: Record<string, string> = {};
  for (const field of fields) {
    data[field] = text(body, field, required.includes(field));
    if (data[field] && (field.endsWith('Date') || field === 'deadline' || field === 'approveDeadline') && !validateDate(data[field])) throw new ApiError(400, 'INVALID_DATE', '日期格式不正确，请重新选择');
  }
  if (data.startDate && data.endDate && data.startDate > data.endDate) throw new ApiError(400, 'DATE_ORDER', '截止日期不能早于开始日期');
  return data;
}

export async function collectionRoute(request: Request, env: Environment, parts: string[], member: Member | null): Promise<Response> {
  const definition = Object.hasOwn(definitions, parts[1]) ? definitions[parts[1] as keyof typeof definitions] : undefined;
  if (!definition || parts.length > 4) throw new ApiError(404, 'NOT_FOUND', '没有找到该内容');
  const { table, key, result } = definition;
  const id = parts[2];
  if (['GET', 'HEAD'].includes(request.method) && !id) {
    if (!member) {
      const items = definition.source.map(item => ({ ...item, updatedAt: '', updatedBy: null }));
      return json({ items, total: items.length });
    }
    const rows = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all<Row>();
    const items = rows.results.map(row => present(row, key));
    return json({ items, total: items.length });
  }
  if (!member) throw new ApiError(401, 'LOGIN_REQUIRED', '请先登录，再修改团队资料');
  if (request.method === 'POST' && !id) {
    const data = editable(await readBody(request), definition.fields, definition.required);
    const now = new Date().toISOString();
    for (let attempt = 0; attempt < 5; attempt++) {
      const maximum = await env.DB.prepare(`SELECT MAX(CAST(substr(id, 2) AS INTEGER)) AS number FROM ${table} WHERE id GLOB ?`).bind(`${definition.prefix}[0-9]*`).first<{ number: number | null }>();
      const newId = definition.prefix + String((maximum?.number || 0) + 1).padStart(definition.digits, '0');
      const serialized = JSON.stringify(data);
      const inserted = await env.DB.batch([
        env.DB.prepare(`INSERT OR IGNORE INTO ${table} (id, data, updated_at, updated_by) VALUES (?, ?, ?, ?)`).bind(newId, serialized, now, member.id),
        env.DB.prepare("INSERT INTO forum_audit (entity, entity_id, action, user_id, created_at, data) SELECT ?, ?, 'create', ?, ?, ? WHERE changes() = 1").bind(table, newId, member.id, now, serialized),
      ]);
      if (inserted[0].meta.changes === 1) return json({ [result]: { ...data, [key]: newId, updatedAt: now, updatedBy: null } }, 201);
    }
    throw new ApiError(409, 'CONFLICT', '多人同时新增，请重试一次');
  }
  if (!id || !/^[a-zA-Z0-9-]{1,40}$/.test(id)) throw new ApiError(404, 'NOT_FOUND', '没有找到该记录');
  const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<Row>();
  if (!row) throw new ApiError(404, 'NOT_FOUND', '该记录已不存在，请刷新列表');
  const now = new Date().toISOString();
  if (request.method === 'DELETE' && parts.length === 3) {
    const deleted = await env.DB.batch([
      env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id),
      env.DB.prepare("INSERT INTO forum_audit (entity, entity_id, action, user_id, created_at, data) SELECT ?, ?, 'delete', ?, ?, ? WHERE changes() = 1").bind(table, id, member.id, now, row.data),
    ]);
    if (deleted[0].meta.changes !== 1) throw new ApiError(404, 'NOT_FOUND', '该记录已被删除');
    return json({ [key]: id });
  }
  const statusOnly = request.method === 'PATCH' && parts[3] === 'status';
  if (!(request.method === 'PUT' && parts.length === 3) && !statusOnly) throw new ApiError(405, 'METHOD_NOT_ALLOWED', '不支持该操作');
  const body = await readBody(request);
  const data = statusOnly ? { status: text(body, 'status', true, 100) } : editable(body, definition.fields, definition.required);
  const updated = await env.DB.batch([
    env.DB.prepare(statusOnly
      ? `UPDATE ${table} SET data = json_set(data, '$.status', ?), updated_at = ?, updated_by = ? WHERE id = ?`
      : `UPDATE ${table} SET data = ?, updated_at = ?, updated_by = ? WHERE id = ?`)
      .bind(statusOnly ? data.status : JSON.stringify(data), now, member.id, id),
    env.DB.prepare("INSERT INTO forum_audit (entity, entity_id, action, user_id, created_at, data) SELECT ?, ?, ?, ?, ?, ? WHERE changes() = 1").bind(table, id, statusOnly ? 'status' : 'update', member.id, now, JSON.stringify(data)),
  ]);
  if (updated[0].meta.changes !== 1) throw new ApiError(404, 'NOT_FOUND', '记录已不存在，请刷新列表');
  const saved = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<Row>();
  return json({ [result]: present(saved!, key) });
}
