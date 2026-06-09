import { ProjectHealth } from '../../types/risk';

interface ProjectHealthChartProps {
  projects: ProjectHealth[];
}

export default function ProjectHealthChart({ projects }: ProjectHealthChartProps) {
  const maxScore = Math.max(...projects.map(p => p.risk_score), 10);

  return (
    <div className="bg-card-bg border border-border-slate rounded-xl p-6 shadow-2xs hover:shadow-xs transition-shadow duration-300 select-none">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-3">
        <div>
          <h3 className="text-lg font-serif font-normal text-primary tracking-wide">Project Risk Score Analytics</h3>
          <p className="text-xs text-secondary/90 font-medium mt-0.5">Calculated dynamically: (Escalations × 5) + (Risks × 3) + (Overdue × 2)</p>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-bold uppercase select-none">
          <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5" /> High Risk (&ge;15)</span>
          <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-1.5" /> Med Risk (5-14)</span>
          <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5" /> Low Risk (&lt;5)</span>
        </div>
      </div>

      <div className="space-y-5">
        {projects.map(p => {
          const percentage = Math.min((p.risk_score / maxScore) * 100, 100);
          
          let color = 'bg-green-500';
          let bgLight = 'bg-green-50';
          let textColor = 'text-green-700';
          let label = 'Low Risk';
          
          if (p.risk_score >= 15) {
            color = 'bg-red-500';
            bgLight = 'bg-red-50';
            textColor = 'text-red-700';
            label = 'High Risk';
          } else if (p.risk_score >= 5) {
            color = 'bg-yellow-500';
            bgLight = 'bg-yellow-50';
            textColor = 'text-yellow-700';
            label = 'Medium Risk';
          }

          return (
            <div key={p.id} className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{p.name}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bgLight} ${textColor} border border-current/20`}>
                    {label}: {p.risk_score}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {p.status}
                  </span>
                </div>
              </div>

              {/* Bar Layout */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
