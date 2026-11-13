import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './database.mjs';

for (const [pathname, expected, key] of [
  ['/api/forum-tasks', 322, 'taskId'],
  ['/api/forum-notices', 59, 'noticeId'],
  ['/api/forum-decisions', 25, 'decisionId'],
]) {
  test(pathname + ' gives guests only the original archive', async context => {
    const app = fixture();
    context.after(app.close);
    const response = await app.request(pathname);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.total, expected);
    assert.equal(new Set(body.items.map(item => item[key])).size, expected);
    assert.ok(body.items.every(item => item.updatedAt === '' && item.updatedBy === null));
  });
}

test('unauthenticated writes cannot alter team records', async context => {
  const app = fixture();
  context.after(app.close);
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    const response = await app.request('/api/forum-tasks/T001', { method });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error.code, 'LOGIN_REQUIRED');
  }
  assert.equal((await (await app.request('/api/forum-tasks')).json()).total, 322);
});

test('unknown APIs, unsupported operations and object prototypes are not exposed', async context => {
  const app = fixture();
  context.after(app.close);
  for (const pathname of ['/api/missing', '/api/toString', '/api/__proto__', '/api/forum-tasks/T001/status/extra']) {
    assert.equal((await app.request(pathname)).status, 404);
  }
  assert.equal((await app.request('/api/auth/invalid')).status, 404);
});

test('capabilities report online collaboration and security headers remain present', async context => {
  const app = fixture();
  context.after(app.close);
  const body = await (await app.request('/api/site-status')).json();
  assert.equal(body.readOnly, true);
  assert.equal(body.authenticationConnected, true);
  assert.equal(body.liveCollaborationConnected, true);
  const head = await app.request('/api/forum-tasks', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const page = await app.request('/tasks');
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.match(page.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
});

test('cross-site or missing-source writes are refused', async context => {
  const app = fixture();
  context.after(app.close);
  for (const headers of [{ Origin: 'https://untrusted.test' }, { Origin: '' }, { 'X-CSO-Request': '' }]) {
    const response = await app.request('/api/auth/login', { method: 'POST', body: {}, headers });
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error.code, 'INVALID_ORIGIN');
  }
});
