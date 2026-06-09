interface RiskDistributionChartProps {
  risksCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export default function RiskDistributionChart({ risksCount }: RiskDistributionChartProps) {
  const criticalVal = risksCount.critical || 0;
  const highVal = risksCount.high || 0;
  const mediumVal = risksCount.medium || 0;
  const lowVal = risksCount.low || 0;

  const total = criticalVal + highVal + mediumVal + lowVal || 1;
  const hasData = (criticalVal + highVal + mediumVal + lowVal) > 0;
  
  const stats = [
    { label: 'Critical', count: criticalVal, color: 'bg-red-500', text: 'text-red-600', fill: '#EF4444' },
    { label: 'High', count: highVal, color: 'bg-orange-500', text: 'text-orange-600', fill: '#F97316' },
    { label: 'Medium', count: mediumVal, color: 'bg-yellow-500', text: 'text-yellow-600', fill: '#EAB308' },
    { label: 'Low', count: lowVal, color: 'bg-blue-500', text: 'text-blue-600', fill: '#3B82F6' },
  ];

  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="bg-card-bg border border-border-slate rounded-xl p-6 shadow-2xs hover:shadow-xs transition-shadow duration-300 flex flex-col justify-between h-full select-none">
      <div>
        <h3 className="text-lg font-serif font-normal text-primary tracking-wide">Risk Severity Allocation</h3>
        <p className="text-xs text-secondary/90 font-medium mt-0.5">Breakdown of active project risks by severity tier</p>
      </div>

      <div className="flex items-center justify-around my-4 gap-4">
        {/* Donut Graphic */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {hasData && stats.map((s, index) => {
              const percentage = (s.count / total) * 100;
              const strokeDashoffset = circumference - (percentage / 100) * circumference;
              const offset = currentOffset;
              currentOffset += (percentage / 100) * circumference;

              if (s.count === 0) return null;

              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={s.fill}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset - offset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-primary leading-none">
              {hasData ? total : 0}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Risks</span>
          </div>
        </div>

        {/* Legend block */}
        <div className="space-y-1.5 select-none grow">
          {stats.map((s, idx) => {
            const pct = hasData ? Math.round((s.count / total) * 100) : 0;
            return (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.color} shrink-0`} />
                  <span className="text-slate-500 truncate max-w-[65px]">{s.label}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-slate-700 font-bold">{s.count}</span>
                  <span className={`text-[10px] ${s.text} font-bold w-8 text-right`}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
