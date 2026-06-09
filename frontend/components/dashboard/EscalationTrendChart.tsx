export default function EscalationTrendChart() {
  const trendData = [
    { day: 'Mon', count: 1 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 2 },
    { day: 'Thu', count: 1 },
    { day: 'Fri', count: 3 },
    { day: 'Sat', count: 2 },
    { day: 'Sun', count: 1 },
  ];

  const maxVal = 4;
  const height = 120;
  const width = 500;
  const padding = 20;

  const points = trendData.map((d, index) => {
    const x = padding + (index * (width - 2 * padding)) / (trendData.length - 1);
    const y = height - padding - (d.count * (height - 2 * padding)) / maxVal;
    return { x, y, day: d.day, count: d.count };
  });

  const pathD = points.reduce((acc, p, index) => {
    return acc + (index === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="bg-card-bg border border-border-slate rounded-xl p-6 shadow-2xs hover:shadow-xs transition-shadow duration-300 flex flex-col justify-between h-full select-none">
      <div>
        <h3 className="text-lg font-serif font-normal text-primary tracking-wide">Escalation Activity Trend</h3>
        <p className="text-xs text-secondary/90 font-medium mt-0.5">Weekly tracking of newly reported project blockers</p>
      </div>

      <div className="my-4 relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(val => {
            const y = height - padding - (val * (height - 2 * padding)) / maxVal;
            return (
              <line 
                key={val} 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="#E2E8F0" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGrad)" opacity="0.15" />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke="#E06B36" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {points.map((p, index) => (
            <g key={index} className="group/dot cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                fill="#FFFFFF" 
                stroke="#0D6A5D" 
                strokeWidth="2.5"
                className="hover:r-6 hover:fill-accent transition-all duration-150"
              />
              <text 
                x={p.x} 
                y={p.y - 10} 
                textAnchor="middle" 
                className="text-[9px] font-bold fill-primary opacity-0 group-hover/dot:opacity-100 transition-opacity"
              >
                {p.count}
              </text>
            </g>
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E06B36" />
              <stop offset="100%" stopColor="#E06B36" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex justify-between px-5 text-[10px] font-bold text-slate-400 select-none">
        {trendData.map(d => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}
