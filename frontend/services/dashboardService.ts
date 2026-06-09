import { API_BASE_URL } from './api';

export interface DashboardStats {
  total_meetings: number;
  open_tasks: number;
  overdue_tasks: number;
  open_escalations: number;
  active_risks: number;
  high_risk_projects: number;
}

const EMPTY_STATS: DashboardStats = {
  total_meetings: 0,
  open_tasks: 0,
  overdue_tasks: 0,
  open_escalations: 0,
  active_risks: 0,
  high_risk_projects: 0,
};

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/`);
      if (response.ok) {
        const data = await response.json();
        return data as DashboardStats;
      }
    } catch (e) {
      console.warn('[dashboardService] Backend not reachable, returning empty dashboard stats:', e);
    }
    return EMPTY_STATS;
  },
};
