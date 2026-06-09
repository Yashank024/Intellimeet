"use client";

import { useState } from 'react';
import { Meeting } from '../../types/meeting';
import { X, FileText, CheckSquare, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface MeetingDetailsProps {
  meeting: Meeting;
  onClose: () => void;
}

export default function MeetingDetails({ meeting, onClose }: MeetingDetailsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-card-bg border-l border-border-slate shadow-xl flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-6 border-b border-border-slate flex justify-between items-start bg-slate-50/50">
        <div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wide">
            {meeting.projectName || 'General'}
          </span>
          <h2 className="text-lg font-bold text-primary mt-2">{meeting.title}</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Synced on {meeting.date}</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border-slate">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-colors ${
            activeTab === 'summary' 
              ? 'border-accent text-primary bg-card-bg font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Summary &amp; Entities
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-colors ${
            activeTab === 'transcript' 
              ? 'border-accent text-primary bg-card-bg font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Full Transcript
        </button>
      </div>

      {/* Content drawer scroll area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'summary' ? (
          <>
            {/* Summary Card */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Executive Summary</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {meeting.summary}
              </p>
            </div>

            {/* Extracted Tasks */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4" />
                <span>Extracted Action Items ({meeting.tasks?.length || 0})</span>
              </h3>
              {(!meeting.tasks || meeting.tasks.length === 0) ? (
                <p className="text-xs text-slate-450 italic ml-6">No tasks assigned during this meeting.</p>
              ) : (
                <div className="space-y-2.5 ml-6">
                  {meeting.tasks.map((t, idx) => (
                    <div key={idx} className="bg-card-bg border border-border-slate rounded-lg p-3 hover:border-slate-350 transition-colors">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-700">{t.task}</p>
                        {t.priority && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-650 border border-slate-200`}>
                            {t.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-2">
                        <span>Owner: <strong className="text-slate-600 font-extrabold">{t.owner}</strong></span>
                        <span>Deadline: <strong className="text-slate-600 font-extrabold">{t.deadline}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted Escalations */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>Escalations &amp; Blockers ({meeting.escalations?.length || 0})</span>
              </h3>
              {(!meeting.escalations || meeting.escalations.length === 0) ? (
                <p className="text-xs text-slate-450 italic ml-6">No active blockers escalated during this meeting.</p>
              ) : (
                <div className="space-y-2.5 ml-6">
                  {meeting.escalations.map((e, idx) => (
                    <div key={idx} className="bg-red-50/20 border border-red-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-red-900">{e.description}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200`}>
                          {e.severity || 'High'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-450 font-semibold mt-2">
                        Raised by: <strong className="text-slate-600 font-extrabold">{e.raised_by}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted Risks */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span>Potential Risks ({meeting.risks?.length || 0})</span>
              </h3>
              {(!meeting.risks || meeting.risks.length === 0) ? (
                <p className="text-xs text-slate-450 italic ml-6">No release risks identified during this meeting.</p>
              ) : (
                <div className="space-y-2.5 ml-6">
                  {meeting.risks.map((r, idx) => (
                    <div key={idx} className="bg-orange-50/10 border border-orange-200 rounded-lg p-3 flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-700">{r.description}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-orange-50 text-orange-700 border-orange-200`}>
                        {r.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted Decisions */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-accent" />
                <span>Decisions Agreed ({meeting.decisions?.length || 0})</span>
              </h3>
              {(!meeting.decisions || meeting.decisions.length === 0) ? (
                <p className="text-xs text-slate-450 italic ml-6">No key decisions documented during this meeting.</p>
              ) : (
                <div className="space-y-2.5 ml-6">
                  {meeting.decisions.map((d, idx) => (
                    <div key={idx} className="bg-card-bg border border-border-slate rounded-lg p-3">
                      <p className="text-xs font-bold text-slate-700">Decided: {d.decision}</p>
                      {d.reason && <p className="text-[10px] text-slate-450 font-semibold mt-1">Reasoning: {d.reason}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-slate-900 text-slate-350 text-xs p-5 rounded-xl font-mono leading-relaxed whitespace-pre-wrap select-text h-full border border-slate-800">
            {meeting.transcript}
          </div>
        )}
      </div>
    </div>
  );
}
