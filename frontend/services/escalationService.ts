import { API_BASE_URL } from './api';
import { Escalation } from '../types/escalation';

export const escalationService = {
  async getEscalations(): Promise<Escalation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/escalations/`);
      if (response.ok) {
        const data = await response.json();
        return data.escalations.map((e: any) => ({
          id: e.id,
          project_id: e.meeting_id,
          projectName: e.project_name,
          raised_by_id: 1,
          raisedByName: e.assigned_to || 'Unassigned',
          description: e.title,
          severity: e.severity as 'Medium' | 'High' | 'Critical',
          status: e.status as 'Open' | 'Resolved',
          date_raised: e.created_at ? e.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
        }));
      }
    } catch (e) {
      console.warn('[escalationService] Backend not reachable:', e);
    }
    return [];
  },

  async updateStatus(escId: number, status: Escalation['status']): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/escalations/${escId}/status?status=${status}`, {
        method: 'PUT',
      });
      return response.ok;
    } catch (e) {
      console.warn('[escalationService] Status update failed:', e);
      return false;
    }
  },
};
