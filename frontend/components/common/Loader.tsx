import { Loader2 } from 'lucide-react';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = 'Loading system data...' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card-bg border border-border-slate rounded-xl shadow-xs">
      <Loader2 className="h-8 w-8 text-accent animate-spin mb-4" />
      <p className="text-sm font-semibold text-secondary">{message}</p>
    </div>
  );
}
