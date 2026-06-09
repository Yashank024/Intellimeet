import { API_BASE_URL } from './api';
import { Meeting } from '../types/meeting';

export const meetingService = {
  async getMeetings(): Promise<Meeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetings/`);
      if (response.ok) {
        const data = await response.json();
        return data.meetings.map((m: any) => ({
          id: m.id,
          title: m.title,
          projectName: m.project_name,
          date: m.date,
          duration: m.duration,
          summary: m.summary,
          transcript: m.transcript
        }));
      }
    } catch (e) {
      console.warn('[meetingService] Backend not reachable:', e);
    }
    return [];
  },

  async uploadMeeting(meeting: Omit<Meeting, 'id'>, file?: File): Promise<Meeting> {
    const formData = new FormData();
    formData.append('title', meeting.title);
    formData.append('project', meeting.projectName || 'General');
    if (meeting.transcript) {
      formData.append('text', meeting.transcript);
    }
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }

    const result = await response.json();
    const meetingData = result.data;
    const ext = meetingData.extracted_data;

    return {
      id: meetingData.meeting_id,
      title: meeting.title,
      projectName: meetingData.project_name,
      date: ext.date || new Date().toISOString().split('T')[0],
      summary: meetingData.summary,
      transcript: meeting.transcript || '',
      tasks: ext.tasks?.map((t: any) => ({
        owner: t.assigned_to || 'Unassigned',
        task: t.title,
        deadline: t.due_date || '',
        priority: t.priority || 'Medium',
      })),
      risks: ext.risks?.map((r: any) => ({
        description: r.title,
        severity: r.severity || 'Medium',
      })),
      escalations: ext.escalations?.map((e: any) => ({
        raised_by: e.assigned_to || 'Unassigned',
        description: e.title,
        severity: e.severity || 'Medium',
      })),
    };
  },
};
