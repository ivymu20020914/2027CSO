import { CollaborationBar } from '@/components/auth/CollaborationBar';
import { useAuth } from '@/runtime/auth';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, ListChecks, Megaphone, AlertTriangle, Users } from 'lucide-react';
import { PROJECT } from '@client/src/data/project';

const NAV_ITEMS = [
  { to: '/', label: '总览看板', icon: LayoutGrid, end: true },
  { to: '/tasks', label: '任务中心', icon: ListChecks, end: false },
  { to: '/notices', label: '通知公告', icon: Megaphone, end: false },
  { to: '/decisions', label: '决策风险', icon: AlertTriangle, end: false },
  { to: '/team', label: '团队分工', icon: Users, end: false },
] as const;

const Layout = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="relative overflow-hidden border-b border-[#001233]"
        style={{
          background:
            'linear-gradient(to bottom right, var(--header-start), var(--brand) 55%, var(--header-end))',
        }}
      >
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-white/5"
          style={{ transform: 'skewX(-20deg) translateX(25%)' }}
        />
        <div className="relative mx-auto flex max-w-[1280px] flex-col gap-4 px-4 sm:px-8 pb-5 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-white text-[13px] font-black text-[#0033A0]">
              CSO
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div>
              <div className="text-base font-extrabold tracking-tight text-white">
                2027 CSO 全球可持续发展论坛
              </div>
              <div className="text-[11px] font-medium tracking-wide text-blue-100/80">
                {PROJECT.theme} · 项目执行管理看板
              </div>
            </div>
          </div>
          <nav aria-label="主导航" className="hidden items-center gap-1 overflow-x-auto md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'flex shrink-0 items-center gap-1.5 px-3 py-2 text-[12px] font-bold transition-colors',
                      isActive
                        ? 'bg-white text-[#0033A0]'
                        : 'text-blue-100/85 hover:bg-white/10 hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <CollaborationBar />

      <main className="mx-auto max-w-[1280px] px-4 pb-12 pt-6 sm:px-8 sm:pt-8">
        <Outlet key={user?.id ?? 'guest'} />
      </main>

      <footer className="border-t border-border pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 sm:px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
          <span>2027 CSO Forum · Execution Command Center</span>
          <span>
            {PROJECT.host} · 启动 {PROJECT.startDate} | 举办 {PROJECT.forumDate} | 收官{' '}
            {PROJECT.commsEndDate}
          </span>
        </div>
      </footer>
      <nav aria-label="手机导航" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] shadow-md md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => [
                'flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-bold transition-colors',
                isActive ? 'bg-accent text-primary' : 'text-slate-500 hover:bg-muted',
              ].join(' ')}>
              <Icon className="size-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
