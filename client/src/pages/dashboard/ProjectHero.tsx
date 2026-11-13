import { CalendarDays, MapPin, Building2, Users, Flag } from 'lucide-react';
import { PROJECT } from '@client/src/data/project';

const ProjectHero = () => {
  const metaItems = [
    { icon: CalendarDays, label: '启动 · 举办 · 收官', value: `${PROJECT.startDate} · ${PROJECT.forumDate} · ${PROJECT.commsEndDate}` },
    { icon: MapPin, label: '举办地点', value: PROJECT.location },
    { icon: Building2, label: '发起 / 主办', value: `${PROJECT.organizer} / ${PROJECT.host}` },
  ];

  return (
    <section
      className="relative overflow-hidden border border-[#001233] px-4 py-8 sm:px-8 sm:py-12"
      style={{
        background:
          'linear-gradient(to bottom right, var(--header-start), var(--brand) 55%, var(--header-end))',
      }}
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-white/5"
        style={{ transform: 'skewX(-20deg) translateX(25%)' }}
      />
      <div className="relative grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
            <Flag className="size-3" />
            第十六届 CSO 论坛 · 执行启动版
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
            {PROJECT.name}
          </h1>
          <p className="mt-3 text-sm font-medium tracking-wide text-blue-100/80">
            {PROJECT.theme}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {PROJECT.leaders.map((leader) => (
              <span
                key={leader.label}
                className="inline-flex items-center gap-1.5 border border-white/15 bg-black/10 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
              >
                <Users className="size-3 text-blue-200" />
                {leader.label} · {leader.name}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="border border-white/10 bg-black/10 p-6 backdrop-blur-sm">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
              Project Brief
            </div>
            <ul className="space-y-4">
              {metaItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-blue-200" />
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-tight text-blue-100/70">
                        {item.label}
                      </div>
                      <div className="mt-0.5 text-[12px] font-bold leading-snug text-white">
                        {item.value}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProjectHero };
