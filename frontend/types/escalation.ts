export interface Escalation {
  id: number;
  project_id: number;
  projectName: string;
  raised_by_id: number;
  raisedByName: string;
  description: string;
  severity: 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Resolved';
  date_raised: string;
}
