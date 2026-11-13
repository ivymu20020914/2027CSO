import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';

await mkdir('.deploy', { recursive: true });
await mkdir('downloads', { recursive: true });
const privatePath = '.deploy/initial-access.json';
try {
  await access(privatePath);
  const existing = JSON.parse(await readFile(privatePath, 'utf8'));
  console.log(`Existing administrator instructions: ${existing.downloadPath}`);
} catch (failure) {
  if (failure.code !== 'ENOENT') throw failure;
  const code = randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const hash = createHash('sha256').update(code).digest('hex');
  const downloadPath = `downloads/gxc1-admin-${randomBytes(12).toString('hex')}.txt`;
  const expiry = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'long', timeStyle: 'short' }).format(expiresAt);
  const instructions = [
    '2027 CSO 论坛 · 管理员首次开通',
    '',
    '网站：https://gxc1.code-me.app',
    '',
    '1. 打开网站，点击顶部「团队登录」。',
    '2. 选择「凭码开通」，填写下方开通码、您的姓名，以及自行设置的账号和密码。',
    '3. 密码至少10位。请保存自己的账号密码，不要与其他网站共用。',
    '4. 开通后即可新增、编辑、删除任务、公告和决策，保存后会多设备同步。',
    '5. 使用「邀请成员」为每位同事生成独立开通码。不要共用管理员账号。',
    '',
    `管理员一次性开通码：${code}`,
    `有效期至：${expiry}（北京时间）`,
    '',
    '此码仅可开通一个管理员账号。请妥善保管本文件，不要公开或发送到群内。',
    '未登录的访客只能看到上传时的原始方案，无法看到团队的协作修改。',
    '如果网站暂时无法打开，请待访问恢复后再开通，不要将开通码填到其他网站。',
  ].join('\n');
  await writeFile(privatePath, JSON.stringify({ code, expiresAt, downloadPath }), { mode: 0o600 });
  await writeFile(downloadPath, instructions, { mode: 0o600 });
  await writeFile('.deploy/initial-access.sql', `INSERT OR IGNORE INTO forum_invite (hash, role, expires_at, created_by) VALUES ('${hash}', 'admin', ${expiresAt}, 'project-bootstrap');`, { mode: 0o600 });
  console.log(`Prepared administrator instructions: ${downloadPath}`);
}
