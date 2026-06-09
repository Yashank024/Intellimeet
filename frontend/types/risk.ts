export interface ProjectRisk {
  id: number;
  project_id?: number;
  projectName: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigationPlan?: string;
  status: 'Active' | 'Mitigated';
}

export interface ProjectHealth {
  id: number;
  name: string;
  status: 'High Risk' | 'Medium Risk' | 'On Track' | 'Active' | 'Completed' | 'On Hold';
  priority?: 'Low' | 'Medium' | 'High';
  risk_score: number;
  open_escalations?: number;
  open_risks?: number;
  overdue_tasks?: number;
}
