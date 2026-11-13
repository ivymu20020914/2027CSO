import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center border border-border bg-muted">
        <Inbox className="size-5 text-[#94A3B8]" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700">{title}</p>
        {description && (
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#94A3B8]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
};

export { EmptyState };
