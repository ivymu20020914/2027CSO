import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const base = process.argv[2];
if (!base || !/^https:\/\/[a-z0-9.-]+$/.test(base)) throw new Error('A published HTTPS origin is required.');
const unique = randomBytes(8).toString('hex');
const username = `verify.${unique}`;
const password = randomBytes(24).toString('hex');
const invitation = randomBytes(24).toString('hex');
const invitationHash = createHash('sha256').update(invitation).digest('hex');
const optionValue = `上线检查-${unique}`;
const createdRecords = [];
const results = { project: 'gxc1', deployed: true, checkedAt: new Date().toISOString(), pages: [], api: [], authenticationConnected: false, liveCollaborationConnected: false, fixedDomain: 'https://gxc1.code-me.app', fixedDomainVerified: false };
let cookie = '';

function sql(command) {
  return execFileSync('wrangler', ['d1', 'execute', 'gxc1-forum', '--remote', '--json', '--command', command], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

async function request(path, { method = 'GET', body, session = '', headers = {} } = {}) {
  return fetch(base + path, {
    method,
    signal: AbortSignal.timeout(30_000),
    headers: { Origin: base, 'X-CSO-Request': '1', 'Content-Type': 'application/json', ...(session ? { Cookie: session } : {}), ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

async function expectJson(response, expected = 200) {
  const body = await response.json();
  assert.equal(response.status, expected, JSON.stringify(body));
  return body;
}

try {
  for (const pathname of ['/', '/tasks', '/notices', '/decisions', '/team', '/modules/03']) {
    const response = await request(pathname);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /id="root"/);
    results.pages.push({ pathname, status: response.status });
    if (pathname === '/') {
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match => match[1]);
      assert.ok(assets.length >= 2);
      for (const asset of assets) {
        const fetched = await request(asset);
        assert.equal(fetched.status, 200);
        const content = await fetched.text();
        const access = JSON.parse(await readFile('.deploy/initial-access.json', 'utf8'));
        assert.ok(!content.includes(access.code));
        if (process.env.CLOUDFLARE_API_TOKEN) assert.ok(!content.includes(process.env.CLOUDFLARE_API_TOKEN));
      }
      results.assetsVerified = assets.length;
    }
  }
  assert.equal((await request('/api/forum-tasks', { method: 'POST', body: {} })).status, 401);
  assert.equal((await request('/api/auth/login', { method: 'POST', body: {}, headers: { Origin: 'https://untrusted.test' } })).status, 403);
  sql(`INSERT INTO forum_invite (hash, role, expires_at, created_by) VALUES ('${invitationHash}', 'member', ${Date.now() + 600_000}, 'deployment-verification');`);
  const registration = await request('/api/auth/register', { method: 'POST', body: { invitation, username, name: '上线检查临时成员', password } });
  await expectJson(registration);
  cookie = registration.headers.get('set-cookie')?.split(';')[0] || '';
  assert.ok(cookie);
  assert.match(registration.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/);
  const state = await expectJson(await request('/api/auth/session', { session: cookie }));
  assert.equal(state.user.username, username);
  assert.equal(state.user.role, 'member');
  results.authenticationConnected = true;
  assert.equal((await request('/api/auth/invites', { method: 'POST', session: cookie, body: {} })).status, 403);
  assert.equal((await request('/api/auth/register', { method: 'POST', body: { invitation, username: `again.${unique}`, name: '重复', password } })).status, 400);
  const login = await request('/api/auth/login', { method: 'POST', body: { username, password } });
  await expectJson(login);
  const secondSession = login.headers.get('set-cookie').split(';')[0];
  for (const [collection, key, result, expected] of [['tasks', 'taskId', 'task', 322], ['notices', 'noticeId', 'notice', 59], ['decisions', 'decisionId', 'decision', 25]]) {
    const path = '/api/forum-' + collection;
    const archive = await expectJson(await request(path));
    assert.equal(archive.total, expected);
    const baseline = await expectJson(await request(path, { session: cookie }));
    const original = baseline.items[0];
    const body = { ...original, owner: optionValue, ...(collection === 'tasks' ? { name: optionValue } : collection === 'notices' ? { title: optionValue } : { question: optionValue }) };
    const created = (await expectJson(await request(path, { method: 'POST', session: cookie, body }), 201))[result];
    assert.ok(created.updatedAt);
    const recordPath = `${path}/${created[key]}`;
    createdRecords.push(recordPath);
    const edited = (await expectJson(await request(recordPath, { method: 'PUT', session: cookie, body: { ...created, owner: '同步检查' } })))[result];
    assert.equal(edited.owner, '同步检查');
    const status = collection === 'decisions' ? '已确认' : '进行中';
    assert.equal((await expectJson(await request(recordPath + '/status', { method: 'PATCH', session: cookie, body: { status } })))[result].status, status);
    const shared = await expectJson(await request(path, { session: secondSession }));
    assert.equal(shared.total, baseline.total + 1);
    assert.equal(shared.items.find(item => item[key] === created[key]).owner, '同步检查');
    const guest = await expectJson(await request(path));
    assert.ok(!guest.items.some(item => item[key] === created[key]));
    await expectJson(await request(recordPath, { method: 'DELETE', session: cookie }));
    assert.equal((await request(recordPath, { method: 'DELETE', session: cookie })).status, 404);
    results.api.push({ pathname: path, total: baseline.total, create: true, edit: true, status: true, crossDevice: true, delete: true, guestIsolation: true });
  }
  const option = (await expectJson(await request('/api/forum-options', { method: 'POST', session: cookie, body: { category: 'owner', value: optionValue } }), 201)).option;
  const sharedOptions = await expectJson(await request('/api/forum-options', { session: secondSession }));
  assert.ok(sharedOptions.items.some(item => item.value === option.value));
  results.sharedOptionsVerified = true;
  await expectJson(await request('/api/auth/logout', { method: 'POST', session: cookie, body: {} }));
  assert.equal((await expectJson(await request('/api/auth/session', { session: cookie }))).user, null);
  assert.ok((await expectJson(await request('/api/auth/session', { session: secondSession }))).user);
  await expectJson(await request('/api/auth/logout', { method: 'POST', session: secondSession, body: {} }));
  results.liveCollaborationConnected = true;
  results.mode = 'invited-team-collaboration-with-public-archive';
} finally {
  for (const path of createdRecords) {
    if (cookie) await request(path, { method: 'DELETE', session: cookie }).catch(() => {});
  }
  sql(`DELETE FROM forum_option WHERE category = 'owner' AND value = '${optionValue}'; DELETE FROM forum_audit WHERE user_id IN (SELECT id FROM forum_user WHERE username = '${username}'); DELETE FROM forum_session WHERE user_id IN (SELECT id FROM forum_user WHERE username = '${username}'); DELETE FROM forum_invite WHERE hash = '${invitationHash}'; DELETE FROM forum_user WHERE username = '${username}';`);
}

try {
  const response = await fetch(results.fixedDomain + '/api/site-status', { signal: AbortSignal.timeout(30_000) });
  results.fixedDomainStatus = response.status;
  if (response.status === 200) {
    const status = await response.json();
    results.fixedDomainVerified = status.authenticationConnected === true && status.liveCollaborationConnected === true;
  }
} catch {
  results.fixedDomainStatus = null;
  results.fixedDomainError = 'Connection unavailable';
}

await writeFile('deployment-result.json', JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify({ coreVerified: true, pagesVerified: results.pages.length, collectionsVerified: results.api.length, fixedDomainVerified: results.fixedDomainVerified, fixedDomainStatus: results.fixedDomainStatus }));
