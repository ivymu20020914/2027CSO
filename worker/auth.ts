import { ApiError, json, readBody, text } from './platform.ts';
import type { Environment, Member } from './platform.ts';

const encoder = new TextEncoder();
const sessionSeconds = 7 * 24 * 60 * 60;
const cookieName = '__Host-cso_session';

export function randomCode(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), value => value.toString(16).padStart(2, '0')).join('');
}

export async function digest(value: string): Promise<string> {
  const result = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(result), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function passwordHash(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', iterations: 100_000, salt: encoder.encode(salt) }, key, 256);
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}

function equalHash(first: string, second: string): boolean {
  let difference = first.length ^ second.length;
  for (let index = 0; index < first.length; index++) difference |= first.charCodeAt(index) ^ (second.charCodeAt(index) || 0);
  return difference === 0;
}

function sessionCookie(value: string, seconds = sessionSeconds): Record<string, string> {
  return { 'Set-Cookie': `${cookieName}=${value}; Path=/; Max-Age=${seconds}; HttpOnly; Secure; SameSite=Strict` };
}

async function sessionHash(request: Request): Promise<string> {
  const value = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  return value && /^[a-f0-9]{48}$/.test(value) ? digest(value) : '';
}

export async function getMember(request: Request, env: Environment): Promise<Member | null> {
  const hash = await sessionHash(request);
  if (!hash) return null;
  return env.DB.prepare('SELECT u.id, u.username, u.name, u.role FROM forum_session s JOIN forum_user u ON u.id = s.user_id WHERE s.hash = ? AND s.expires_at > ?')
    .bind(hash, Date.now()).first<Member>();
}

async function rateLimit(request: Request, env: Environment): Promise<void> {
  const now = Date.now();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = await digest(`authentication:${ip}:${Math.floor(now / 900_000)}`);
  const row = await env.DB.prepare('INSERT INTO forum_rate_limit (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count')
    .bind(key, now + 900_000).first<{ count: number }>();
  if (!row || row.count > 15) throw new ApiError(429, 'RATE_LIMIT', '尝试次数较多，请15分钟后再试');
  await env.DB.batch([
    env.DB.prepare('DELETE FROM forum_rate_limit WHERE expires_at < ?').bind(now),
    env.DB.prepare('DELETE FROM forum_session WHERE expires_at < ?').bind(now),
  ]);
}

export async function authRoute(request: Request, env: Environment, pathname: string, member: Member | null): Promise<Response> {
  if (pathname === '/api/auth/session' && ['GET', 'HEAD'].includes(request.method)) return json({ user: member });
  if (request.method !== 'POST') throw new ApiError(404, 'NOT_FOUND', '没有找到该操作');
  if (pathname === '/api/auth/logout') {
    await env.DB.prepare('DELETE FROM forum_session WHERE hash = ?').bind(await sessionHash(request)).run();
    return json({ success: true }, 200, sessionCookie('', 0));
  }
  if (pathname === '/api/auth/invites') {
    if (member?.role !== 'admin') throw new ApiError(403, 'FORBIDDEN', '仅管理员可以邀请成员');
    const code = randomCode();
    const expiresAt = Date.now() + sessionSeconds * 1000;
    await env.DB.prepare('INSERT INTO forum_invite (hash, role, expires_at, created_by) VALUES (?, ?, ?, ?)').bind(await digest(code), 'member', expiresAt, member.id).run();
    return json({ code, expiresAt: new Date(expiresAt).toISOString() }, 201);
  }
  if (!['/api/auth/login', '/api/auth/register'].includes(pathname)) throw new ApiError(404, 'NOT_FOUND', '没有找到该操作');
  await rateLimit(request, env);
  const body = await readBody(request);
  const username = text(body, 'username', true, 40).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[a-z0-9][a-z0-9_.-]{2,39}$/.test(username) || password.length < 10 || password.length > 128) throw new ApiError(400, 'INVALID_CREDENTIALS', '账号需3—40位英文字母或数字，密码需10—128位');
  const session = randomCode();
  const sessionDigest = await digest(session);
  const expiresAt = Date.now() + sessionSeconds * 1000;
  let user: Member;
  if (pathname === '/api/auth/register') {
    const name = text(body, 'name', true, 40);
    const invitation = text(body, 'invitation', true, 100);
    const invitationHash = await digest(invitation);
    const available = await env.DB.prepare('SELECT role FROM forum_invite WHERE hash = ? AND used_by IS NULL AND expires_at > ?').bind(invitationHash, Date.now()).first<{ role: Member['role'] }>();
    if (!available) throw new ApiError(400, 'INVALID_INVITE', '开通码无效、已使用或已过期，请联系管理员');
    if (await env.DB.prepare('SELECT id FROM forum_user WHERE username = ?').bind(username).first()) throw new ApiError(409, 'USERNAME_EXISTS', '该账号已被使用，请换一个账号');
    const id = crypto.randomUUID();
    const salt = randomCode();
    const hashed = await passwordHash(password, salt);
    const results = await env.DB.batch([
      env.DB.prepare('INSERT INTO forum_user (id, username, name, role, password_hash, salt, created_at) SELECT ?, ?, ?, role, ?, ?, ? FROM forum_invite WHERE hash = ? AND used_by IS NULL AND expires_at > ?').bind(id, username, name, hashed, salt, Date.now(), invitationHash, Date.now()),
      env.DB.prepare('UPDATE forum_invite SET used_by = ? WHERE hash = ? AND used_by IS NULL AND EXISTS(SELECT 1 FROM forum_user WHERE id = ?)').bind(id, invitationHash, id),
      env.DB.prepare('INSERT INTO forum_session (hash, user_id, expires_at) SELECT ?, id, ? FROM forum_user WHERE id = ?').bind(sessionDigest, expiresAt, id),
    ]);
    if (results[0].meta.changes !== 1) throw new ApiError(409, 'INVITE_USED', '开通码已被使用，请联系管理员');
    user = { id, username, name, role: available.role };
  } else {
    const stored = await env.DB.prepare('SELECT id, username, name, role, password_hash, salt FROM forum_user WHERE username = ?').bind(username).first<Member & { password_hash: string; salt: string }>();
    const hashed = await passwordHash(password, stored?.salt || 'cso-unregistered-account');
    if (!stored || !equalHash(hashed, stored.password_hash)) throw new ApiError(401, 'LOGIN_FAILED', '账号或密码不正确');
    user = { id: stored.id, username: stored.username, name: stored.name, role: stored.role };
    await env.DB.prepare('INSERT INTO forum_session (hash, user_id, expires_at) VALUES (?, ?, ?)').bind(sessionDigest, user.id, expiresAt).run();
  }
  return json({ user }, 200, sessionCookie(session));
}
