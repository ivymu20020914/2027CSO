import { useState } from 'react';
import { LogIn, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/runtime/auth';
import { axiosForBackend } from '@/runtime/http';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoginDialog } from './LoginDialog';
import { InviteDialog } from './InviteDialog';

export function CollaborationBar() {
  const { user, isLoading, isError, refresh, updateSession } = useAuth();
  const queryClient = useQueryClient();
  const [loginOpen, setLoginOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await axiosForBackend.post('/api/auth/logout', {});
      await updateSession({ user: null });
      toast.success('已退出，当前仅展示原始方案');
    } catch (failure) {
      toast.error(getApiErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  async function synchronize() {
    setBusy(true);
    try {
      await queryClient.refetchQueries({ type: 'active', predicate: query => String(query.queryKey[0]).startsWith('forum-') }, { throwOnError: true });
      toast.success('已同步最新资料');
    } catch {
      toast.error('同步未完成，请检查网络后重试');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <div className="thin-border border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <div role="status" className="min-w-0 space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-bold text-primary"><ShieldCheck className="size-3" />{user ? `${user.name} · 团队协作` : isLoading ? '正在确认登录状态…' : '原始方案 · 访客浏览'}</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{isError ? '暂未能确认登录状态，请重试。' : user ? '保存后多设备同步；其他成员的更新每30秒自动同步，也可手动刷新。' : '当前展示上传时的原始方案。登录后查看团队最新进度并编辑，协作修改不对访客公开。'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {user ? <>
            <Button size="sm" variant="outline" className="rounded-none" disabled={busy} onClick={() => { void synchronize(); }}><RefreshCw className="size-3" />刷新资料</Button>
            {user.role === 'admin' && <InviteDialog />}
            <Button size="sm" variant="ghost" className="rounded-none" disabled={busy} onClick={() => { void logout(); }}><LogOut className="size-3" />退出</Button>
          </> : <>
            {isError && <Button size="sm" variant="outline" className="rounded-none" onClick={refresh}>重新连接</Button>}
            <Button size="sm" className="rounded-none" disabled={isLoading} onClick={() => setLoginOpen(true)}><LogIn className="size-3" />团队登录</Button>
          </>}
        </div>
      </div>
    </div>
    <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
  </>;
}
