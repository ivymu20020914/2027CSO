import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './database.mjs';

test('registration requires a valid one-time invitation and cannot self-promote', async context => {
  const app = fixture();
  context.after(app.close);
  const invitation = await app.invite('member');
  const body = { invitation, username: 'member.one', name: '协作成员', password: 'private-password-42', role: 'admin' };
  const registration = await app.request('/api/auth/register', { method: 'POST', body });
  assert.equal(registration.status, 200);
  assert.equal((await registration.json()).user.role, 'member');
  assert.match(registration.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/);
  const second = await app.request('/api/auth/register', { method: 'POST', body: { ...body, username: 'member.two' } });
  assert.equal(second.status, 400);
  assert.equal(app.sqlite.prepare('SELECT COUNT(*) AS total FROM forum_user').get().total, 1);
  const stored = app.sqlite.prepare('SELECT * FROM forum_user').get();
  assert.notEqual(stored.password_hash, body.password);
  assert.equal(stored.password_hash.length, 64);
  assert.ok(stored.salt.length > 20);
});

test('separate devices can log in and logout revokes only the current session', async context => {
  const app = fixture();
  context.after(app.close);
  const firstCookie = await app.register();
  const login = await app.request('/api/auth/login', { method: 'POST', body: { username: 'project.admin', password: 'test-password-4927' } });
  assert.equal(login.status, 200);
  const secondCookie = login.headers.get('set-cookie').split(';')[0];
  assert.notEqual(firstCookie, secondCookie);
  assert.equal((await (await app.request('/api/auth/session', { cookie: firstCookie })).json()).user.role, 'admin');
  await app.request('/api/auth/logout', { method: 'POST', cookie: firstCookie, body: {} });
  assert.equal((await (await app.request('/api/auth/session', { cookie: firstCookie })).json()).user, null);
  assert.ok((await (await app.request('/api/auth/session', { cookie: secondCookie })).json()).user);
  const wrong = await app.request('/api/auth/login', { method: 'POST', body: { username: 'project.admin', password: 'incorrect-password' } });
  assert.equal(wrong.status, 401);
});

test('only administrators create member invitations and expired sessions cannot write', async context => {
  const app = fixture();
  context.after(app.close);
  const cookie = await app.register();
  const invitation = await app.request('/api/auth/invites', { method: 'POST', cookie, body: {} });
  assert.equal(invitation.status, 201);
  const body = await invitation.json();
  assert.equal(body.code.length, 48);
  const member = await app.request('/api/auth/register', { method: 'POST', body: { invitation: body.code, username: 'member.two', name: '第二位', password: 'safe-password-2027' } });
  const memberCookie = member.headers.get('set-cookie').split(';')[0];
  assert.equal((await app.request('/api/auth/invites', { method: 'POST', cookie: memberCookie, body: {} })).status, 403);
  app.sqlite.exec('UPDATE forum_session SET expires_at = 0');
  assert.equal((await app.request('/api/forum-tasks/T001/status', { method: 'PATCH', cookie, body: { status: '已完成' } })).status, 401);
});

test('repeated authentication failures are rate limited', async context => {
  const app = fixture();
  context.after(app.close);
  for (let attempt = 0; attempt < 15; attempt++) {
    const response = await app.request('/api/auth/login', { method: 'POST', body: { username: 'unknown', password: 'long-wrong-password' } });
    assert.equal(response.status, 401);
  }
  const limited = await app.request('/api/auth/login', { method: 'POST', body: { username: 'unknown', password: 'long-wrong-password' } });
  assert.equal(limited.status, 429);
});
