import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { TASKS } from '../client/src/data/tasks.ts';
import { NOTICES } from '../client/src/data/notices.ts';
import { DECISIONS } from '../client/src/data/decisions.ts';
import { digest } from '../worker/auth.ts';
import worker from '../worker/index.ts';

export function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../worker/schema.sql', import.meta.url), 'utf8'));
  for (const [table, key, records] of [['forum_task', 'taskId', TASKS], ['forum_notice', 'noticeId', NOTICES], ['forum_decision', 'decisionId', DECISIONS]]) {
    const statement = sqlite.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`);
    for (const record of records) statement.run(record[key], JSON.stringify(record));
  }
  function prepare(query, values = []) {
    return {
      bind: (...next) => prepare(query, next),
      first: async () => sqlite.prepare(query).get(...values) ?? null,
      all: async () => ({ results: sqlite.prepare(query).all(...values) }),
      run: async () => ({ meta: { changes: Number(sqlite.prepare(query).run(...values).changes) } }),
    };
  }
  const env = {
    DB: {
      prepare,
      batch: async statements => {
        sqlite.exec('BEGIN');
        try {
          const results = [];
          for (const statement of statements) results.push(await statement.run());
          sqlite.exec('COMMIT');
          return results;
        } catch (error) {
          sqlite.exec('ROLLBACK');
          throw error;
        }
      },
    },
    ASSETS: { fetch: async () => new Response('<!doctype html><title>CSO</title>', { headers: { 'Content-Type': 'text/html' } }) },
  };
  const request = (pathname, { method = 'GET', body, cookie, headers, ...init } = {}) => worker.fetch(new Request('https://example.test' + pathname, {
    ...init,
    method,
    headers: {
      Origin: 'https://example.test',
      'X-CSO-Request': '1',
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  }), env);
  async function invite(role = 'admin') {
    const code = crypto.randomUUID();
    sqlite.prepare('INSERT INTO forum_invite (hash, role, expires_at) VALUES (?, ?, ?)').run(await digest(code), role, Date.now() + 60_000);
    return code;
  }
  async function register(role = 'admin', username = 'project.admin') {
    const response = await request('/api/auth/register', { method: 'POST', body: { invitation: await invite(role), username, name: '测试成员', password: 'test-password-4927' } });
    if (response.status !== 200) throw new Error(JSON.stringify(await response.json()));
    return response.headers.get('Set-Cookie').split(';')[0];
  }
  return { sqlite, env, request, register, invite, close: () => sqlite.close() };
}
