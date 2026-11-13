import { OPTION_CATEGORIES } from '../shared/api.interface.ts';
import { ApiError, json, readBody, text } from './platform.ts';
import type { Environment, Member } from './platform.ts';

export async function optionRoute(request: Request, env: Environment, member: Member | null): Promise<Response> {
  if (['GET', 'HEAD'].includes(request.method)) {
    const items = member ? (await env.DB.prepare('SELECT category, value, code, sort_order AS sortOrder FROM forum_option ORDER BY sort_order').all()).results : [];
    return json({ items });
  }
  if (!member) throw new ApiError(401, 'LOGIN_REQUIRED', '请先登录，再补充团队选项');
  if (request.method !== 'POST') throw new ApiError(405, 'METHOD_NOT_ALLOWED', '不支持该操作');
  const body = await readBody(request);
  const category = text(body, 'category', true, 40);
  const value = text(body, 'value', true, 100);
  if (!(OPTION_CATEGORIES as readonly string[]).includes(category)) throw new ApiError(400, 'INVALID_CATEGORY', '请选择有效的选项分类');
  for (let attempt = 0; attempt < 5; attempt++) {
    const maximum = await env.DB.prepare("SELECT MAX(CAST(substr(code, 2) AS INTEGER)) AS number FROM forum_option WHERE category = 'module'").first<{ number: number | null }>();
    const code = category === 'module' ? `C${String((maximum?.number || 0) + 1).padStart(2, '0')}` : null;
    await env.DB.prepare('INSERT OR IGNORE INTO forum_option (category, value, code) VALUES (?, ?, ?)').bind(category, value, code).run();
    const option = await env.DB.prepare('SELECT category, value, code, sort_order AS sortOrder FROM forum_option WHERE category = ? AND value = ?').bind(category, value).first();
    if (option) return json({ option }, 201);
  }
  throw new ApiError(409, 'CONFLICT', '多人同时新增，请重试一次');
}
