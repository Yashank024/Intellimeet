"use client";

import { useMeetings } from '../hooks/useMeetings';
import { useEscalations } from '../hooks/useEscalations';
import { useRisks } from '../hooks/useRisks';
import PageHeader from '../components/layout/PageHeader';
import StatsCard from '../components/dashboard/StatsCard';
import ProjectHealthChart from '../components/dashboard/ProjectHealthChart';
import EscalationTrendChart from '../components/dashboard/EscalationTrendChart';
import RiskDistributionChart from '../components/dashboard/RiskDistributionChart';
import RecentMeetings from '../components/dashboard/RecentMeetings';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import { 
  CalendarRange, 
  CheckSquare, 
  AlertOctagon, 
  ShieldAlert, 
  Clock, 
  Activity 
} from 'lucide-react';

export default function DashboardPage() {
  const { meetings, loading: mLoading, error: mError } = useMeetings();
  const { escalations, loading: eLoading, error: eError } = useEscalations();
  const { projects, risks, tasks, loading: rLoading, error: rError } = useRisks();

  const loading = mLoading || eLoading || rLoading;
  const error = mError || eError || rError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader message="Loading executive intelligence dashboard..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  // Calculate dynamic stats
  const totalMeetings = meetings.length;
  const openTasks = tasks.filter(t => t.status === 'Pending').length;
  const openEscalations = escalations.filter(e => e.status === 'Open').length;
  const projectsAtRisk = projects.filter(p => p.risk_score >= 15).length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
  const activeRisks = risks.filter(r => r.status === 'Active').length;

  const risksCount = {
    critical: escalations.filter(e => e.status === 'Open' && e.severity === 'Critical').length,
    high: risks.filter(r => r.status === 'Active' && r.severity === 'High').length,
    medium: risks.filter(r => r.status === 'Active' && r.severity === 'Medium').length,
    low: risks.filter(r => r.status === 'Active' && r.severity === 'Low').length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Executive Leadership Dashboard" 
        description="Dynamic organizational health indicators, open escalations, and active project risks tracking."
      />

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard 
          title="Total Meetings" 
          value={totalMeetings} 
          icon={CalendarRange} 
          description="Total processed syncing sessions"
          colorClass="text-primary"
        />
        <StatsCard 
          title="Open Tasks" 
          value={openTasks} 
          icon={CheckSquare} 
          description="Tasks awaiting completion"
          colorClass="text-secondary"
          trend={{ value: 'Active', isPositive: true }}
        />
        <StatsCard 
          title="Open Escalations" 
          value={openEscalations} 
          icon={AlertOctagon} 
          description="Blockers escalated to leadership"
          colorClass="text-accent"
          isAlert
        />
        <StatsCard 
          title="Projects At Risk" 
          value={projectsAtRisk} 
          icon={ShieldAlert} 
          description="Projects with score &ge; 15"
          colorClass="text-accent"
          isAlert
        />
        <StatsCard 
          title="Overdue Tasks" 
          value={overdueTasks} 
          icon={Clock} 
          description="Action items past target dates"
          colorClass="text-accent"
          isAlert
        />
        <StatsCard 
          title="Active Risks" 
          value={activeRisks} 
          icon={Activity} 
          description="Unmitigated project threats"
          colorClass="text-primary"
        />
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectHealthChart projects={projects} />
        </div>
        <div>
          <RiskDistributionChart risksCount={risksCount} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <EscalationTrendChart />
        </div>
        <div className="lg:col-span-2">
          <RecentMeetings meetings={meetings} />
        </div>
      </div>
    </div>
  );
}
