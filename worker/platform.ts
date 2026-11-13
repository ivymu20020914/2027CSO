export interface Statement {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}

export interface Database {
  prepare(query: string): Statement;
  batch(statements: Statement[]): Promise<{ meta: { changes: number } }[]>;
}

export interface Environment {
  ASSETS: { fetch(request: Request): Promise<Response> };
  DB: Database;
}

export interface Member {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'member';
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new ApiError(415, 'INVALID_FORMAT', '请使用页面上的表单提交');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'INVALID_BODY', '请填写提交内容');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 65_536) {
      await reader.cancel();
      throw new ApiError(413, 'TOO_LARGE', '提交内容过长，请精简后重试');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (body && typeof body === 'object' && !Array.isArray(body)) return body;
  } catch {}
  throw new ApiError(400, 'INVALID_BODY', '提交内容不完整，请重新填写');
}

export function text(body: Record<string, unknown>, key: string, required = false, max = 4000): string {
  const value = body[key];
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new ApiError(400, 'INVALID_FIELD', '请检查必填内容及文字长度');
  return value.trim();
}

export function checkWriteOrigin(request: Request): void {
  if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('X-CSO-Request') !== '1') throw new ApiError(403, 'INVALID_ORIGIN', '请从网站页面完成操作');
}
