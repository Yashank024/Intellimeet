export interface Employee {
  id: number;
  name: string;
  email: string;
  team: string;
  role: string;
}

export interface Task {
  id: number;
  project_id: number;
  projectName: string;
  owner_id: number;
  ownerName: string;
  task: string;
  deadline: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High';
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  transcript: string;
  summary: string;
  project_id?: number;
  projectName?: string;
  tasks?: {
    owner: string;
    task: string;
    deadline: string;
    priority?: string;
  }[];
  blockers?: {
    description: string;
  }[];
  risks?: {
    description: string;
    severity: string;
  }[];
  escalations?: {
    raised_by: string;
    description: string;
    severity?: string;
  }[];
  decisions?: {
    decision: string;
    reason: string;
  }[];
  teams?: string[];
}
