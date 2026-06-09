"use client";

import { useEscalations } from '../../hooks/useEscalations';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { AlertOctagon, CheckCircle2, ShieldAlert, Activity, Search } from 'lucide-react';
import { useState } from 'react';

export default function EscalationCenter() {
  const { escalations, loading, error, resolveEscalation } = useEscalations();
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader message="Loading active organization blockages..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  // Calculate statistics
  const total = escalations.length;
  const openCount = escalations.filter(e => e.status === 'Open').length;
  const resolvedCount = escalations.filter(e => e.status === 'Resolved').length;
  const criticalCount = escalations.filter(e => e.status === 'Open' && e.severity === 'Critical').length;

  // Apply filters
  const filtered = escalations.filter(e => {
    const matchesSeverity = filterSeverity === 'All' || e.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || e.status === filterStatus;
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) || 
                          e.projectName.toLowerCase().includes(search.toLowerCase()) ||
                          e.raisedByName.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Escalation &amp; Blocker Center"
        description="Monitor critical blockers, audit stakeholder ownerships, and resolve project bottlenecks."
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-border-slate rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-405 uppercase">Total Logged</p>
            <p className="text-2xl font-black text-primary mt-1">{total}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
            <Activity className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-card-bg border border-border-slate rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-405 uppercase">Active Open</p>
            <p className="text-2xl font-black text-red-650 mt-1">{openCount}</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-650">
            <AlertOctagon className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-card-bg border border-border-slate rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-405 uppercase">Critical Severity</p>
            <p className="text-2xl font-black text-red-800 mt-1">{criticalCount}</p>
          </div>
          <div className="p-3 bg-red-100/30 border border-red-100 rounded-lg text-red-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-card-bg border border-border-slate rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-405 uppercase">Resolved Blockers</p>
            <p className="text-2xl font-black text-green-650 mt-1">{resolvedCount}</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-card-bg border border-border-slate rounded-xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 bg-slate-50/50 border border-border-slate rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent"
            placeholder="Search descriptions, projects..."
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="w-full text-xs font-bold text-slate-700 bg-slate-50/50 border border-border-slate rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent appearance-none cursor-pointer"
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full text-xs font-bold text-slate-700 bg-slate-50/50 border border-border-slate rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent appearance-none cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Escalation Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No escalations match filters"
          description="Try relaxing your filters or searching different keywords."
        />
      ) : (
        <div className="bg-card-bg border border-border-slate rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border-slate text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Project Name</th>
                  <th className="py-4 px-6">Raised By</th>
                  <th className="py-4 px-6">Date Logged</th>
                  <th className="py-4 px-6">Severity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <p className="font-bold text-slate-800 leading-normal">{e.description}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-bold">
                        {e.projectName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[9px] uppercase border border-slate-200">
                          {e.raisedByName.slice(0, 2)}
                        </div>
                        <span>{e.raisedByName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-medium">{e.date_raised}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        e.severity === 'Critical' 
                          ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                          : e.severity === 'High' 
                            ? 'bg-orange-50 text-orange-700 border-orange-200' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {e.severity}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        e.status === 'Open'
                          ? 'bg-red-50 text-red-605 border-red-200'
                          : 'bg-green-50 text-green-605 border-green-200'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {e.status === 'Open' ? (
                        <button
                          onClick={() => resolveEscalation(e.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
                        >
                          Resolve Blocker
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 flex items-center justify-end gap-1 select-none">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
