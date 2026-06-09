"use client";

import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import MeetingCard from '../../components/meetings/MeetingCard';
import MeetingDetails from '../../components/meetings/MeetingDetails';
import { useMeetings } from '../../hooks/useMeetings';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { Search, Folder } from 'lucide-react';

export default function MeetingsPage() {
  const { meetings, loading, error } = useMeetings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [activeMeeting, setActiveMeeting] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <Loader message="Loading sync logs archives..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  // Get unique project names for filtering
  const projects = ['All', ...Array.from(new Set(meetings.map(m => m.projectName || 'General')))];

  // Apply search filtering rules
  const filteredMeetings = meetings.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === 'All' || m.projectName === selectedProject;
    return matchesSearch && matchesProject;
  });

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[80vh] pb-12">
      <PageHeader
        title="Meetings Log Archives"
        description="Search meeting transcript recordings, review AI-generated summary highlights, and explore parsed action plans."
      />

      {/* Filter Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card-bg border border-border-slate rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 bg-slate-50/50 border border-border-slate rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent"
            placeholder="Search titles or keywords..."
          />
        </div>

        <div className="relative flex items-center">
          <Folder className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 bg-slate-50/50 border border-border-slate rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-accent appearance-none cursor-pointer"
          >
            {projects.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="text-right flex items-center justify-end px-2">
          <span className="text-xs text-slate-400 font-bold">
            Showing {filteredMeetings.length} of {meetings.length} meetings
          </span>
        </div>
      </div>

      {/* Grid container */}
      {filteredMeetings.length === 0 ? (
        <EmptyState
          title="No meetings found"
          description="Try modifying search keywords or checking project selection dropdown filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onExpand={(m) => setActiveMeeting(m)}
            />
          ))}
        </div>
      )}

      {/* Drawer Overlay */}
      {activeMeeting && (
        <>
          <div 
            onClick={() => setActiveMeeting(null)} 
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
          />
          <MeetingDetails
            meeting={activeMeeting}
            onClose={() => setActiveMeeting(null)}
          />
        </>
      )}
    </div>
  );
}
