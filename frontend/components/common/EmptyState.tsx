import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card-bg border border-border-slate border-dashed rounded-xl">
      <Inbox className="h-10 w-10 text-slate-300 mb-3" />
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      <p className="text-xs text-secondary font-medium mt-1 max-w-xs">{description}</p>
    </div>
  );
}
