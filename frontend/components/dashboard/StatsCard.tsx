import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorClass?: string;
  isAlert?: boolean;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  colorClass = 'text-primary',
  isAlert = false
}: StatsCardProps) {
  const hasAlertValue = isAlert && Number(value) > 0;
  
  return (
    <div className={`bg-card-bg border rounded-xl p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between select-none ${
      hasAlertValue 
        ? 'border-accent/30 bg-accent-light/30' 
        : 'border-border-slate hover:border-primary/25'
    }`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold text-secondary/90 tracking-widest uppercase">{title}</p>
          <h3 className={`text-3xl font-extrabold tracking-tight mt-1.5 leading-none ${
            hasAlertValue ? 'text-accent-dark font-black' : 'text-primary font-black'
          }`}>{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border transition-colors ${
          hasAlertValue
            ? 'bg-accent-light border-accent/20 text-accent-dark'
            : 'bg-bg-slate/50 border-border-slate/60 ' + colorClass
        }`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3">
        <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[75%]">{description}</span>
        {trend && (
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full select-none ${
            trend.isPositive 
              ? 'bg-primary/15 text-primary border border-primary/20' 
              : 'bg-accent-light text-accent-dark border border-accent/20'
          }`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
