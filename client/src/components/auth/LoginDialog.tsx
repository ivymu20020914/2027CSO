import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { axiosForBackend } from '@/runtime/http';
import { useAuth, type Member } from '@/runtime/auth';
import { getApiErrorMessage } from '@/lib/api-error';

interface Props { open: boolean; onOpenChange: (open: boolean) => void }

export function LoginDialog({ open, onOpenChange }: Props) {
  const { updateSession } = useAuth();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function changeMode(next: boolean) {
    setRegister(next);
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    if (register && body.password !== body.confirmPassword) {
      setError('两次密码不一致，请重新填写');
      setBusy(false);
      return;
    }
    try {
      const { data } = await axiosForBackend.post<{ user: Member }>(`/api/auth/${register ? 'register' : 'login'}`, body);
      await updateSession(data);
      onOpenChange(false);
      toast.success(register ? '账号已开通，可以开始协作' : '已登录，团队资料已同步');
    } catch (failure) {
      setError(getApiErrorMessage(failure, '暂时无法登录，请稍后再试'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => { if (!busy) { setError(''); onOpenChange(next); } }}>
      <DialogContent className="bp-card max-h-[85dvh] overflow-y-auto rounded-none bg-card p-6 shadow-md sm:max-w-md">
        <DialogHeader>
          <p className="bp-label">TEAM WORKSPACE</p>
          <DialogTitle className="font-display text-2xl">{register ? '开通团队账号' : '团队登录'}</DialogTitle>
          <DialogDescription>{register ? '凭管理员提供的开通码注册，每个开通码仅可使用一次。' : '登录后可修改任务、公告和决策，修改将在其他设备同步。'}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={register ? 'outline' : 'default'} className="rounded-none" disabled={busy} onClick={() => changeMode(false)}>已有账号</Button>
          <Button variant={register ? 'default' : 'outline'} className="rounded-none" disabled={busy} onClick={() => changeMode(true)}>凭码开通</Button>
        </div>
        <form key={String(register)} onSubmit={submit} className="space-y-4">
          {register && <div className="space-y-2"><Label htmlFor="auth-invitation">开通码</Label><Input id="auth-invitation" name="invitation" autoComplete="off" className="rounded-none tnum" maxLength={100} required /></div>}
          {register && <div className="space-y-2"><Label htmlFor="auth-name">姓名</Label><Input id="auth-name" name="name" autoComplete="name" className="rounded-none" maxLength={40} required /></div>}
          <div className="space-y-2"><Label htmlFor="auth-username">登录账号</Label><Input id="auth-username" name="username" autoComplete="username" className="rounded-none" placeholder="3—40位英文字母或数字" minLength={3} maxLength={40} pattern="[A-Za-z0-9][A-Za-z0-9_.\-]{2,39}" autoCapitalize="none" spellCheck={false} required /></div>
          <div className="space-y-2"><Label htmlFor="auth-password">密码</Label><Input id="auth-password" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} className="rounded-none" placeholder="至少10位，请勿与其他网站共用" minLength={10} maxLength={128} required /></div>
          {register && <div className="space-y-2"><Label htmlFor="auth-confirm">再次输入密码</Label><Input id="auth-confirm" name="confirmPassword" type="password" autoComplete="new-password" className="rounded-none" minLength={10} maxLength={128} required /></div>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full rounded-none">{busy ? '正在处理…' : register ? '开通并进入协作' : '登录协作'}</Button>
          <p className="text-xs leading-relaxed text-muted-foreground">请勿向他人提供密码。忘记密码请联系项目管理员。</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
