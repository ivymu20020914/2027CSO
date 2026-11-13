import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  aux?: string;
  badge?: ReactNode;
}

const KpiCard = ({ label, value, aux, badge }: KpiCardProps) => {
  return (
    <div className="flex flex-col gap-2 p-4 bp-hairline-r last:border-r-0">
      <div className="bp-kpi-label">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="tnum text-xl font-bold text-slate-800">{value}</span>
        {badge}
      </div>
      {aux && <div className="text-[10px] font-medium text-[#94A3B8]">{aux}</div>}
    </div>
  );
};

interface KpiRowProps {
  children: ReactNode;
  className?: string;
}

const KpiRow = ({ children, className = '' }: KpiRowProps) => (
  <div
    className={`grid grid-cols-2 border-y border-border md:grid-cols-5 ${className}`}
  >
    {children}
  </div>
);

export { KpiCard, KpiRow };
