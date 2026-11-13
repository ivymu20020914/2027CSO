import { UserCog, ShieldCheck, Ban } from 'lucide-react';
import { ReportCard } from '@client/src/components/blueprint/ReportCard';
import { SectionHeader } from '@client/src/components/blueprint/SectionHeader';
import { Badge } from '@client/src/components/blueprint/StatusBadge';
import { TEAM } from '@client/src/data/project';
import { OPERATING_RULES } from '@client/src/data/rules';
import type { TeamMember } from '@client/src/data/types';

const MemberField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="bp-hairline-t pt-3">
    <div className="bp-kpi-label mb-1">{label}</div>
    <p className="text-[11px] font-medium leading-relaxed text-slate-600">{children}</p>
  </div>
);

const TeamPage = () => {
  return (
    <div className="rise space-y-8">
      <SectionHeader index="06" title="团队分工与规则" english="RACI & Operating Rules" />

      <section className="grid gap-8 md:grid-cols-2">
        {TEAM.map((m: TeamMember) => (
          <ReportCard key={m.name}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight text-slate-900">{m.name}</h3>
                  <Badge tone="brand">{m.role}</Badge>
                </div>
                <p className="bp-sublabel mt-1">{m.core}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="tnum text-2xl font-bold text-[#0033A0]">{m.taskCount}</span>
                <span className="bp-kpi-label">主责任务</span>
              </div>
            </div>
            <div className="space-y-3">
              <MemberField label="具体承担工作">{m.work}</MemberField>
              <MemberField label="审批 / 沟通职责">{m.approval}</MemberField>
              <div className="bp-hairline-t pt-3">
                <div className="mb-1 flex items-center gap-1 bp-kpi-label">
                  <Ban className="size-3 text-[#F59E0B]" />
                  不应承担的事项
                </div>
                <p className="text-[11px] font-medium leading-relaxed text-slate-600">{m.notDo}</p>
              </div>
              {m.note && (
                <p className="flex items-start gap-1.5 bg-status-warning-bg p-2 text-[10px] font-medium leading-relaxed text-[#B45309]">
                  <ShieldCheck className="mt-0.5 size-3 shrink-0" />
                  {m.note}
                </p>
              )}
            </div>
          </ReportCard>
        ))}
      </section>

      <section>
        <SectionHeader index="07" title="表格使用规则" english="10 Operating Rules" />
        <ReportCard>
          <ul className="grid gap-0 md:grid-cols-2">
            {OPERATING_RULES.map((rule, i) => (
              <li
                key={rule.no}
                className={`flex gap-4 p-4 ${i % 2 === 0 ? 'md:border-r md:border-border' : ''} bp-hairline-b`}
              >
                <div className="flex size-8 shrink-0 items-center justify-center bg-[#0033A0] text-[12px] font-black text-white">
                  {String(rule.no).padStart(2, '0')}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                    <UserCog className="size-3 text-[#0033A0]" />
                    {rule.title}
                  </div>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#94A3B8]">
                    {rule.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </ReportCard>
      </section>
    </div>
  );
};

export default TeamPage;
