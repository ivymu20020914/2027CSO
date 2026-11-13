interface SectionHeaderProps {
  index: string;
  title: string;
  english?: string;
  action?: React.ReactNode;
}

const SectionHeader = ({ index, title, english, action }: SectionHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="bp-label mb-1">
          {index}. {title}
        </div>
        {english && <div className="bp-sublabel">{english}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export { SectionHeader };
