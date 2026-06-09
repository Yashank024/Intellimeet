import { Employee, Task, Meeting } from '../types/meeting';
import { ProjectRisk, ProjectHealth } from '../types/risk';
import { Escalation } from '../types/escalation';

// Employee Directory Roster (Seeded manually according to backend specs)
export const SEED_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Yashank Gupta', email: 'yashank@intellimeet.com', team: 'IntimeTec', role: 'AI Engineer' },
  { id: 2, name: 'Rahul Sharma', email: 'rahul@intellimeet.com', team: 'Engineering', role: 'Backend Engineer' },
  { id: 3, name: 'Priya Verma', email: 'priya@intellimeet.com', team: 'Product', role: 'Product Manager' },
  { id: 4, name: 'Amit Singh', email: 'amit@intellimeet.com', team: 'Engineering', role: 'Engineering Manager' }
];

// Pristine Empty States for Demo Ingestions
export const SEED_PROJECTS: ProjectHealth[] = [];
export const SEED_TASKS: Task[] = [];
export const SEED_ESCALATIONS: Escalation[] = [];
export const SEED_RISKS: ProjectRisk[] = [];
export const SEED_MEETINGS: Meeting[] = [];

// LocalStorage Helper wrapper
const IS_BROWSER = typeof window !== 'undefined';

const loadLocal = <T>(key: string, defaultValue: T): T => {
  if (!IS_BROWSER) return defaultValue;
  const data = localStorage.getItem(`intellimeet_v4_${key}`);
  return data ? JSON.parse(data) : defaultValue;
};

const saveLocal = <T>(key: string, value: T) => {
  if (IS_BROWSER) {
    localStorage.setItem(`intellimeet_v4_${key}`, JSON.stringify(value));
  }
};

// Database state accessor
export const getEmployees = (): Employee[] => loadLocal('employees', SEED_EMPLOYEES);
export const getProjects = (): ProjectHealth[] => {
  const projects = loadLocal('projects', SEED_PROJECTS);
  // Recompute Risk Scores dynamically to guarantee accuracy
  return projects.map(p => {
    const score = calculateRiskScore(p.id);
    return { ...p, risk_score: score };
  });
};
export const getTasks = (): Task[] => loadLocal('tasks', SEED_TASKS);
export const getEscalations = (): Escalation[] => loadLocal('escalations', SEED_ESCALATIONS);
export const getRisks = (): ProjectRisk[] => loadLocal('risks', SEED_RISKS);
export const getMeetings = (): Meeting[] => loadLocal('meetings', SEED_MEETINGS);

// Dynamic Risk Scoring Engine Formula
// Risk Score = (Open Escalations * 5) + (Open Risks * 3) + (Overdue Tasks * 2)
export const calculateRiskScore = (projectId: number): number => {
  const escalations = getEscalations().filter(e => e.project_id === projectId && e.status === 'Open');
  const risks = getRisks().filter(r => r.project_id === projectId && r.status === 'Active');
  const tasks = getTasks().filter(t => t.project_id === projectId && t.status === 'Overdue');
  
  return (escalations.length * 5) + (risks.length * 3) + (tasks.length * 2);
};

// State Modifiers
export const addTask = (task: Omit<Task, 'id'>): Task => {
  const tasks = getTasks();
  const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const newTask = { ...task, id: newId };
  tasks.push(newTask);
  saveLocal('tasks', tasks);
  updateProjectScores();
  return newTask;
};

export const updateTaskStatus = (taskId: number, status: Task['status']): Task | null => {
  const tasks = getTasks();
  const taskIdx = tasks.findIndex(t => t.id === taskId);
  if (taskIdx === -1) return null;
  tasks[taskIdx].status = status;
  saveLocal('tasks', tasks);
  updateProjectScores();
  return tasks[taskIdx];
};

export const addEscalation = (esc: Omit<Escalation, 'id' | 'date_raised'>): Escalation => {
  const escs = getEscalations();
  const newId = escs.length > 0 ? Math.max(...escs.map(e => e.id)) + 1 : 1;
  const newEsc: Escalation = {
    ...esc,
    id: newId,
    date_raised: new Date().toISOString().split('T')[0]
  };
  escs.push(newEsc);
  saveLocal('escalations', escs);
  updateProjectScores();
  return newEsc;
};

export const updateEscalationStatus = (escId: number, status: Escalation['status']): Escalation | null => {
  const escs = getEscalations();
  const escIdx = escs.findIndex(e => e.id === escId);
  if (escIdx === -1) return null;
  escs[escIdx].status = status;
  saveLocal('escalations', escs);
  updateProjectScores();
  return escs[escIdx];
};

export const updateProjectScores = () => {
  const projects = loadLocal('projects', SEED_PROJECTS);
  const updated = projects.map(p => {
    const score = calculateRiskScore(p.id);
    return { ...p, risk_score: score };
  });
  saveLocal('projects', updated);
};

export const addMeeting = (meeting: Omit<Meeting, 'id'>): Meeting => {
  const meetings = getMeetings();
  const newId = meetings.length > 0 ? Math.max(...meetings.map(m => m.id)) + 1 : 1;
  const newMeeting = { ...meeting, id: newId };
  meetings.push(newMeeting);
  saveLocal('meetings', meetings);
  
  // Also parse and add any extracted entities to the global SQLite-equivalent state!
  const projects = getProjects();
  let projectId = 1; // Default fallback to Payment Integration
  if (meeting.projectName) {
    const existing = projects.find(p => p.name.toLowerCase() === meeting.projectName?.toLowerCase());
    if (existing) {
      projectId = existing.id;
    } else {
      // create new project
      const newPId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
      const newP: ProjectHealth = {
        id: newPId,
        name: meeting.projectName,
        status: 'Active',
        priority: 'Medium',
        risk_score: 0,
        open_escalations: 0,
        open_risks: 0,
        overdue_tasks: 0
      };
      projects.push(newP);
      saveLocal('projects', projects);
      projectId = newPId;
    }
  }

  // Insert Tasks
  if (meeting.tasks) {
    meeting.tasks.forEach(t => {
      const employees = getEmployees();
      const matchedEmp = employees.find(e => e.name.toLowerCase() === t.owner.toLowerCase());
      addTask({
        project_id: projectId,
        projectName: meeting.projectName || 'General',
        owner_id: matchedEmp ? matchedEmp.id : 1, // Default to Rahul
        ownerName: t.owner,
        task: t.task,
        deadline: t.deadline,
        status: 'Pending',
        priority: (t.priority as Task['priority']) || 'Medium'
      });
    });
  }

  // Insert Escalations
  if (meeting.escalations) {
    meeting.escalations.forEach(e => {
      const employees = getEmployees();
      const matchedEmp = employees.find(emp => emp.name.toLowerCase() === e.raised_by.toLowerCase());
      addEscalation({
        project_id: projectId,
        projectName: meeting.projectName || 'General',
        raised_by_id: matchedEmp ? matchedEmp.id : 2, // Default to Priya
        raisedByName: e.raised_by,
        description: e.description,
        severity: (e.severity as Escalation['severity']) || 'High',
        status: 'Open'
      });
    });
  }

  // Insert Risks
  if (meeting.risks) {
    meeting.risks.forEach(r => {
      const risks = getRisks();
      const newRId = risks.length > 0 ? Math.max(...risks.map(risk => risk.id)) + 1 : 1;
      risks.push({
        id: newRId,
        project_id: projectId,
        projectName: meeting.projectName || 'General',
        description: r.description,
        severity: (r.severity as ProjectRisk['severity']) || 'High',
        status: 'Active'
      });
      saveLocal('risks', risks);
    });
  }

  updateProjectScores();
  return newMeeting;
};
