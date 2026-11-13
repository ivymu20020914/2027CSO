import type { ReactNode } from 'react';

interface VerdictCardProps {
  label: string;
  value: string;
  subtitle?: string;
  todos?: string[];
  children?: ReactNode;
}

const VerdictCard = ({ label, value, subtitle, todos, children }: VerdictCardProps) => {
  return (
    <div
      className="flex flex-col gap-4 p-6 shadow-md"
      style={{
        background: 'linear-gradient(to bottom right, var(--header-start), var(--brand) 60%, var(--header-end))',
      }}
    >
      <div className="text-[11px] font-black uppercase tracking-[0.15em] text-white/50">
        {label}
      </div>
      <div className="font-display text-3xl font-black leading-tight text-white">{value}</div>
      {subtitle && (
        <div className="text-[11px] font-medium uppercase tracking-widest text-white/60">
          {subtitle}
        </div>
      )}
      {todos && todos.length > 0 && (
        <ul className="mt-2 space-y-2 border-t border-white/15 pt-4">
          {todos.map((todo: string, i: number) => (
            <li key={i} className="flex items-start gap-2.5 text-[11px] font-bold text-white">
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span className="leading-snug">{todo}</span>
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
};

export { VerdictCard };
