import type { ReactNode } from 'react';

interface ReportCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const ReportCard = ({ children, className = '', id }: ReportCardProps) => {
  return (
    <div id={id} className={`bp-card min-w-0 p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  label?: string;
  title: string;
  english?: string;
  action?: ReactNode;
}

const CardHeader = ({ label, title, english, action }: CardHeaderProps) => {
  return (
    <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        {label && <div className="bp-label mb-1">{label}</div>}
        <h3 className="text-base font-extrabold tracking-tight text-foreground">{title}</h3>
        {english && <p className="bp-sublabel mt-0.5">{english}</p>}
      </div>
      {action && <div className="w-full max-w-full shrink-0 sm:w-auto">{action}</div>}
    </div>
  );
};

ReportCard.Header = CardHeader;

export { ReportCard };
