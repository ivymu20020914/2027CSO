import { useState } from 'react';
import { Copy, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { axiosForBackend } from '@/runtime/http';
import { getApiErrorMessage } from '@/lib/api-error';

export function InviteDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [invitation, setInvitation] = useState<{ code: string; expiresAt: string } | null>(null);
  const [error, setError] = useState('');

  async function create() {
    setBusy(true);
    setError('');
    try {
      const { data } = await axiosForBackend.post('/api/auth/invites', {});
      setInvitation(data);
    } catch (failure) {
      setError(getApiErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(invitation!.code);
      toast.success('已复制，请私下发送给团队成员');
    } catch {
      toast.error('未能自动复制，请选中开通码手动复制');
    }
  }

  return <>
    <Button size="sm" variant="outline" className="rounded-none" onClick={() => { setInvitation(null); setError(''); setOpen(true); }}><UserPlus className="size-3" />邀请成员</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bp-card rounded-none bg-card p-6 shadow-md sm:max-w-md">
        <DialogHeader><DialogTitle>邀请团队成员</DialogTitle><DialogDescription>每个开通码7天内有效，仅可开通一个成员账号。请勿公开发布。</DialogDescription></DialogHeader>
        {invitation ? <div className="space-y-3">
          <Input aria-label="成员开通码" className="rounded-none tnum text-xs" readOnly value={invitation.code} onFocus={event => event.currentTarget.select()} />
          <p className="text-xs text-muted-foreground">有效期至 <span className="tnum">{new Date(invitation.expiresAt).toLocaleString('zh-CN')}</span>。成员在「团队登录 → 凭码开通」中填写此码。</p>
          <Button className="w-full rounded-none" onClick={() => { void copy(); }}><Copy className="size-4" />复制开通码</Button>
        </div> : <Button disabled={busy} className="rounded-none" onClick={() => { void create(); }}>{busy ? '生成中…' : '生成成员开通码'}</Button>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  </>;
}
