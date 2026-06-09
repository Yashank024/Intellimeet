"use client";

import { Meeting } from '../../types/meeting';
import { Calendar, CheckSquare, AlertTriangle } from 'lucide-react';

interface MeetingCardProps {
  meeting: Meeting;
  onExpand: (meeting: Meeting) => void;
}

export default function MeetingCard({ meeting, onExpand }: MeetingCardProps) {
  const taskCount = meeting.tasks?.length || 0;
  const escCount = meeting.escalations?.length || 0;
  const riskCount = meeting.risks?.length || 0;

  return (
    <div className="bg-card-bg border border-border-slate rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-350 transition-all duration-300 flex flex-col justify-between h-full group">
      <div>
        <div className="flex justify-between items-start gap-2">
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wide">
            {meeting.projectName || 'General'}
          </span>
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {meeting.date}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-700 group-hover:text-primary transition-colors mt-2.5 leading-snug">
          {meeting.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-3 mt-2 font-medium leading-relaxed">
          {meeting.summary}
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5 text-xs font-bold text-slate-500">
          <div className="flex items-center space-x-1" title="Tasks extracted">
            <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
            <span>{taskCount}</span>
          </div>
          <div className="flex items-center space-x-1" title="Escalations/blockers">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span>{escCount}</span>
          </div>
          <div className="flex items-center space-x-1" title="Risks identified">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
            <span>{riskCount}</span>
          </div>
        </div>

        <button
          onClick={() => onExpand(meeting)}
          className="text-xs font-bold text-accent hover:text-accent-dark transition-colors cursor-pointer"
        >
          Explore Details &rarr;
        </button>
      </div>
    </div>
  );
}
