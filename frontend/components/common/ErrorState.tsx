import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 border border-red-200 rounded-xl">
      <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
      <h3 className="text-sm font-bold text-red-700">Database Operation Error</h3>
      <p className="text-xs text-red-600 font-medium mt-1 max-w-xs">{message}</p>
    </div>
  );
}
