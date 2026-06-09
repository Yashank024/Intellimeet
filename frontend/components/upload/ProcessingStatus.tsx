"use client";

import { CheckCircle2, Loader2, Play } from 'lucide-react';

interface ProcessingStatusProps {
  currentStage: number;
}

export default function ProcessingStatus({ currentStage }: ProcessingStatusProps) {
  const stages = [
    { label: 'PaddleOCR Ingestion', desc: 'Extracting text blocks from uploaded files or OCR streams.' },
    { label: 'Text Normalization', desc: 'Standardizing transcript formats and removing logs metadata.' },
    { label: 'Gemini Schema Parser', desc: 'Analyzing structures and parsing tasks, blockers, risks, decisions.' },
    { label: 'SQLite & Vector Storage', desc: 'Writing tables into SQLite and indexing chunks into ChromaDB.' },
    { label: 'Automated SMTP Notifier', desc: 'Drafting and logging notification alerts for task owners.' }
  ];

  return (
    <div className="bg-card-bg border border-border-slate rounded-xl p-6 shadow-xs">
      <h3 className="text-sm font-bold text-primary mb-4">Pipeline Execution Stages</h3>
      <div className="space-y-3">
        {stages.map((s, index) => {
          const isDone = index < currentStage;
          const isActive = index === currentStage;
          
          return (
            <div key={index} className={`flex items-start space-x-3.5 p-3 rounded-lg border transition-all duration-300 ${
              isActive 
                ? 'bg-accent-light/40 border-accent/40 shadow-xs' 
                : isDone 
                  ? 'bg-slate-50/50 border-slate-100' 
                  : 'bg-transparent border-transparent opacity-40'
            }`}>
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 text-accent-dark animate-spin" />
                ) : (
                  <Play className="h-4 w-4 text-slate-350 mt-0.5" />
                )}
              </div>
              <div>
                <p className={`text-xs font-bold ${
                  isActive ? 'text-primary' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {s.label}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
