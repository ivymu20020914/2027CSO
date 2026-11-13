interface PagePlaceholderProps {
  index: string;
  title: string;
  english: string;
  description: string;
}

const PagePlaceholder = ({ index, title, english, description }: PagePlaceholderProps) => {
  return (
    <section className="rise space-y-6">
      <div>
        <div className="bp-label mb-1">
          {index}. SECTION
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="bp-sublabel mt-1">{english}</p>
      </div>
      <div className="bp-card flex min-h-[280px] flex-col items-center justify-center gap-2 p-10 text-center">
        <p className="text-sm font-bold text-foreground">{description}</p>
        <p className="text-[11px] font-medium text-[#94A3B8]">页面内容建设中</p>
      </div>
    </section>
  );
};

export { PagePlaceholder };
