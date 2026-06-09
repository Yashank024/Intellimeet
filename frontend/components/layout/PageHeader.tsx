interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 border-b border-border-slate/60 pb-5 gap-4 select-none">
      <div>
        <h2 className="text-3xl font-serif font-normal text-primary tracking-wide leading-tight">{title}</h2>
        {description && <p className="text-sm text-secondary/90 font-medium mt-1.5">{description}</p>}
      </div>
      <div className="flex items-center space-x-3">{children}</div>
    </div>
  );
}
