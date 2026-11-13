import { authRoute, getMember } from './auth.ts';
import { collectionRoute } from './collections.ts';
import { optionRoute } from './options.ts';
import { ApiError, checkWriteOrigin, json } from './platform.ts';
import type { Environment } from './platform.ts';

function secure(response: Response, head: boolean): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  headers.set('Strict-Transport-Security', 'max-age=31536000');
  return new Response(head ? null : response.body, { status: response.status, statusText: response.statusText, headers });
}

async function handle(request: Request, env: Environment): Promise<Response> {
  const pathname = new URL(request.url).pathname.replace(/\/$/, '') || '/';
  if (pathname.startsWith('/api/')) {
    if (!['GET', 'HEAD'].includes(request.method)) checkWriteOrigin(request);
    const member = await getMember(request, env);
    if (pathname.startsWith('/api/auth/')) return authRoute(request, env, pathname, member);
    if (pathname === '/api/site-status' && ['GET', 'HEAD'].includes(request.method)) return json({ readOnly: !member, source: member ? 'team-workspace' : 'uploaded-archive', authenticationConnected: true, liveCollaborationConnected: true });
    if (pathname === '/api/forum-options') return optionRoute(request, env, member);
    return collectionRoute(request, env, pathname.split('/').filter(Boolean), member);
  }
  if (!['GET', 'HEAD'].includes(request.method)) throw new ApiError(405, 'METHOD_NOT_ALLOWED', '当前操作不可用');
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    let response: Response;
    try {
      response = await handle(request, env);
    } catch (error) {
      response = error instanceof ApiError
        ? json({ error: { code: error.code, message: error.message } }, error.status)
        : json({ error: { code: 'UNAVAILABLE', message: '操作暂未完成，请稍后重试；未成功的操作不会提示保存' } }, 503);
    }
    return secure(response, request.method === 'HEAD');
  },
};
