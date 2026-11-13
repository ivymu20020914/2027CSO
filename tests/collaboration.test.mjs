import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './database.mjs';

for (const [collection, key, result] of [
  ['tasks', 'taskId', 'task'], ['notices', 'noticeId', 'notice'], ['decisions', 'decisionId', 'decision'],
]) {
  test(collection + ': create, full edit, status change, cross-device read and confirmed deletion persist', async context => {
    const app = fixture();
    context.after(app.close);
    const cookie = await app.register();
    const path = '/api/forum-' + collection;
    const archive = await (await app.request(path)).json();
    const original = archive.items[0];
    const content = { ...original, updatedAt: 'spoof', updatedBy: 'spoof' };
    const createdResponse = await app.request(path, { method: 'POST', cookie, body: content });
    assert.equal(createdResponse.status, 201);
    const created = (await createdResponse.json())[result];
    assert.notEqual(created[key], original[key]);
    assert.notEqual(created.updatedAt, 'spoof');
    assert.equal(created.updatedBy, null);
    const changedContent = { ...created, owner: '新负责人', status: '自定义共享状态' };
    const changed = await app.request(`${path}/${created[key]}`, { method: 'PUT', cookie, body: changedContent });
    assert.equal(changed.status, 200);
    assert.equal((await changed.json())[result].owner, '新负责人');
    const status = await app.request(`${path}/${created[key]}/status`, { method: 'PATCH', cookie, body: { status: '已完成' } });
    assert.equal(status.status, 200);
    assert.equal((await status.json())[result].status, '已完成');
    const login = await app.request('/api/auth/login', { method: 'POST', body: { username: 'project.admin', password: 'test-password-4927' } });
    const otherCookie = login.headers.get('set-cookie').split(';')[0];
    const synchronized = await (await app.request(path, { cookie: otherCookie })).json();
    assert.equal(synchronized.total, archive.total + 1);
    assert.equal(synchronized.items.find(item => item[key] === created[key]).owner, '新负责人');
    const anonymous = await (await app.request(path)).json();
    assert.equal(anonymous.total, archive.total);
    assert.ok(!anonymous.items.some(item => item[key] === created[key]));
    const removed = await app.request(`${path}/${created[key]}`, { method: 'DELETE', cookie });
    assert.equal(removed.status, 200);
    assert.equal((await removed.json())[key], created[key]);
    assert.equal((await app.request(`${path}/${created[key]}`, { method: 'DELETE', cookie })).status, 404);
    assert.equal((await (await app.request(path, { cookie })).json()).total, archive.total);
    const audit = app.sqlite.prepare('SELECT action, user_id FROM forum_audit ORDER BY id').all();
    assert.deepEqual(audit.map(item => item.action), ['create', 'update', 'status', 'delete']);
    assert.ok(audit.every(item => item.user_id !== 'spoof'));
  });
}

test('shared options deduplicate and custom modules receive a stable unique code', async context => {
  const app = fixture();
  context.after(app.close);
  const cookie = await app.register();
  const create = value => app.request('/api/forum-options', { method: 'POST', cookie, body: { category: 'module', value } });
  const first = (await (await create('补充工作组')).json()).option;
  const duplicate = (await (await create('补充工作组')).json()).option;
  const next = (await (await create('另一个工作组')).json()).option;
  assert.equal(first.code, 'C01');
  assert.equal(first.code, duplicate.code);
  assert.equal(next.code, 'C02');
  assert.equal((await (await app.request('/api/forum-options', { cookie })).json()).items.length, 2);
  assert.equal((await (await app.request('/api/forum-options')).json()).items.length, 0);
  assert.equal((await app.request('/api/forum-options', { method: 'POST', cookie, body: { category: 'admin', value: 'bad' } })).status, 400);
});

test('invalid dates, oversized input and malformed payloads are refused without changing data', async context => {
  const app = fixture();
  context.after(app.close);
  const cookie = await app.register();
  const original = (await (await app.request('/api/forum-tasks', { cookie })).json()).items[0];
  for (const body of [
    { ...original, endDate: '2026-02-30' },
    { ...original, startDate: '2027-01-10', endDate: '2027-01-01' },
    { ...original, name: '' },
    '{broken',
  ]) {
    assert.equal((await app.request('/api/forum-tasks/' + original.taskId, { method: 'PUT', cookie, body })).status, 400);
  }
  assert.equal((await app.request('/api/forum-tasks', { method: 'POST', cookie, body: { name: 'a'.repeat(70_000) } })).status, 413);
  assert.equal(app.sqlite.prepare('SELECT COUNT(*) AS count FROM forum_audit').get().count, 0);
});
