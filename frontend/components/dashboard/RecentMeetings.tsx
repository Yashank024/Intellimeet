import Link from 'next/link';
import { Meeting } from '../../types/meeting';
import { Calendar, CheckSquare, AlertTriangle, ArrowRight } from 'lucide-react';

interface RecentMeetingsProps {
  meetings: Meeting[];
}

export default function RecentMeetings({ meetings }: RecentMeetingsProps) {
  // Get last 3 meetings, reversed to show newest first
  const recent = [...meetings].reverse().slice(0, 3);

  return (
    <div className="bg-card-bg border border-border-slate rounded-xl p-6 shadow-2xs hover:shadow-xs transition-shadow duration-300 select-none">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-serif font-normal text-primary tracking-wide">Recently Processed Meetings</h3>
          <p className="text-xs text-secondary/90 font-medium mt-0.5">Review the most recent transcripts parsed by the ingestion engine</p>
        </div>
        <Link 
          href="/meetings" 
          className="text-xs font-bold text-accent hover:text-accent-dark transition-colors flex items-center gap-1 group shrink-0"
        >
          <span>View Full History</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm font-medium">
          No meetings processed yet. Go to Upload Meeting to begin.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {recent.map((m) => {
            const taskCount = m.tasks?.length || 0;
            const escCount = m.escalations?.length || 0;
            const riskCount = m.risks?.length || 0;
            
            return (
              <div key={m.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="max-w-xl">
                  <div className="flex items-center space-x-2.5">
                    <h4 className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{m.title}</h4>
                    {m.projectName && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {m.projectName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{m.date}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed font-medium">
                    {m.summary}
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-lg select-none">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1 text-slate-600">
                      <CheckSquare className="h-4 w-4" />
                      <span className="text-xs font-bold">{taskCount}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Tasks</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1 text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-bold">{escCount}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Blockers</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1 text-orange-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-bold">{riskCount}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Risks</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
