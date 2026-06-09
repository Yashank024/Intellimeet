import { API_BASE_URL } from './api';
import { ProjectRisk, ProjectHealth } from '../types/risk';
import { Task } from '../types/meeting';

export const riskService = {
  async getProjects(): Promise<ProjectHealth[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/risks/`);
      if (response.ok) {
        const data = await response.json();
        return data.projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          risk_score: p.risk_score,
          status: p.status as 'High Risk' | 'Medium Risk' | 'On Track',
        }));
      }
    } catch (e) {
      console.warn('[riskService] Backend not reachable (getProjects):', e);
    }
    return [];
  },

  async getRisks(): Promise<ProjectRisk[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/risks/`);
      if (response.ok) {
        const data = await response.json();
        return data.risks.map((r: any) => ({
          id: r.id,
          projectName: r.project_name,
          description: r.title,
          severity: r.severity as 'Low' | 'Medium' | 'High' | 'Critical',
          mitigationPlan: r.mitigation_plan,
          status: r.status as 'Active' | 'Mitigated',
        }));
      }
    } catch (e) {
      console.warn('[riskService] Backend not reachable (getRisks):', e);
    }
    return [];
  },

  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/risks/`);
      if (response.ok) {
        const data = await response.json();
        return data.tasks.map((t: any) => ({
          id: t.id,
          project_id: t.id,
          projectName: t.project_name,
          task: t.title,
          owner_id: 1,
          ownerName: t.assigned_to || 'Unassigned',
          deadline: t.due_date || '',
          status: t.status as 'Pending' | 'Completed' | 'Overdue',
          priority: (t.priority || 'Medium') as 'Low' | 'Medium' | 'High',
        }));
      }
    } catch (e) {
      console.warn('[riskService] Backend not reachable (getTasks):', e);
    }
    return [];
  },

  async updateTaskStatus(taskId: number, status: Task['status']): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/risks/tasks/${taskId}/status?status=${status}`, {
        method: 'PUT',
      });
      return response.ok;
    } catch (e) {
      console.warn('[riskService] Task status update failed:', e);
      return false;
    }
  },
};
