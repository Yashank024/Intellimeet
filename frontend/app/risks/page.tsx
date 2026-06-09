"use client";

import { useRisks } from '../../hooks/useRisks';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { ShieldAlert, AlertTriangle, CheckSquare, ShieldCheck } from 'lucide-react';

export default function RiskAnalytics() {
  const { projects, risks, tasks, loading, error, completeTask } = useRisks();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader message="Synthesizing project risk vectors..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Project Risk Analytics"
        description="Monitor real-time project risk vectors and mitigate pending task assignments to reduce score values."
      />

      <div className="space-y-6">
        {projects.map((project) => {
          const projectTasks = tasks.filter(t => t.project_id === project.id);
          const projectRisks = risks.filter(r => r.project_id === project.id);
          
          let scoreColor = 'text-green-600 bg-green-50 border-green-200';
          let borderGlow = '';
          if (project.risk_score >= 15) {
            scoreColor = 'text-red-750 bg-red-50 border-red-200 animate-pulse';
            borderGlow = 'border-red-300 shadow-xs';
          } else if (project.risk_score >= 5) {
            scoreColor = 'text-yellow-605 bg-yellow-50 border-yellow-200';
          }

          return (
            <div 
              key={project.id} 
              className={`bg-card-bg border border-border-slate rounded-xl p-6 shadow-xs hover:shadow-md transition-all duration-300 ${borderGlow}`}
            >
              {/* Top row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-black text-primary">{project.name}</h3>
                  <div className="flex items-center space-x-3 mt-1 text-slate-400 font-bold text-xs">
                    <span className="flex items-center gap-1">
                      Priority: <strong className="text-slate-500 font-extrabold">{project.priority}</strong>
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-350" />
                    <span className="flex items-center gap-1">
                      Status: <strong className="text-slate-500 font-extrabold">{project.status}</strong>
                    </span>
                  </div>
                </div>

                {/* Score Indicator */}
                <div className={`border rounded-xl px-5 py-2.5 flex items-center space-x-4 ${scoreColor}`}>
                  <div className="text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Risk Score</p>
                    <p className="text-3xl font-black mt-0.5 leading-none">{project.risk_score}</p>
                  </div>
                  <div className="h-8 w-px bg-current/20" />
                  <div>
                    <p className="text-xs font-extrabold">
                      {project.risk_score >= 15 
                        ? 'High Severity Risk' 
                        : project.risk_score >= 5 
                          ? 'Medium Risk' 
                          : 'Low Operational Risk'}
                    </p>
                    <p className="text-[10px] font-semibold mt-0.5 opacity-85 leading-normal">
                      Formula: (Esc &times; 5) + (Risk &times; 3) + (Overdue &times; 2)
                    </p>
                  </div>
                </div>
              </div>

              {/* Details grid split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Left: Project Tasks checklists */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4" />
                    <span>Action Items Checklist ({projectTasks.length})</span>
                  </h4>

                  {projectTasks.length === 0 ? (
                    <p className="text-xs text-slate-450 italic">No tasks assigned to this project.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {projectTasks.map((t) => {
                        const isCompleted = t.status === 'Completed';
                        const isOverdue = t.status === 'Overdue';
                        
                        return (
                          <div 
                            key={t.id} 
                            className={`border rounded-xl p-3 flex items-start space-x-3 transition-colors ${
                              isCompleted 
                                ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                                : isOverdue 
                                  ? 'bg-red-50/10 border-red-200' 
                                  : 'bg-card-bg border-border-slate hover:border-slate-350'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              disabled={isCompleted}
                              onChange={() => completeTask(t.id)}
                              className="mt-1.5 h-4 w-4 rounded text-accent focus:ring-accent border-slate-300 cursor-pointer disabled:cursor-not-allowed shrink-0"
                            />
                            <div className="grow select-none">
                              <div className="flex justify-between items-start gap-2">
                                <p className={`text-xs font-bold leading-normal ${
                                  isCompleted ? 'line-through text-slate-400' : 'text-slate-700'
                                }`}>
                                  {t.task}
                                </p>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                  isCompleted 
                                    ? 'bg-slate-55 text-slate-400 border-slate-200' 
                                    : isOverdue 
                                      ? 'bg-red-50 text-red-650 border-red-200'
                                      : 'bg-yellow-50 text-yellow-605 border-yellow-200'
                                }`}>
                                  {t.status}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-2">
                                <span>Assignee: <strong className="text-slate-600 font-extrabold">{t.ownerName}</strong></span>
                                <span>Deadline: <strong className="text-slate-600 font-extrabold">{t.deadline}</strong></span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right: Project Risks overview */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Identified Risk Factors ({projectRisks.length})</span>
                  </h4>

                  {projectRisks.length === 0 ? (
                    <div className="bg-green-50/20 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                      <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-green-800">Operational Space Mitigated</p>
                        <p className="text-[10px] text-green-650 font-semibold mt-0.5">No open risk indicators detected for this project.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {projectRisks.map((r) => (
                        <div 
                          key={r.id} 
                          className={`border rounded-xl p-3 flex justify-between items-center bg-slate-50/50 ${
                            r.severity === 'High' 
                              ? 'border-orange-200' 
                              : r.severity === 'Medium' 
                                ? 'border-yellow-250' 
                                : 'border-blue-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3 mr-4">
                            <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-slate-700 leading-normal">{r.description}</p>
                              <p className="text-[10px] text-slate-400 font-extrabold mt-1 uppercase">Indicator: {r.status}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            r.severity === 'High' 
                              ? 'bg-orange-50 text-orange-700 border-orange-200' 
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {r.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
