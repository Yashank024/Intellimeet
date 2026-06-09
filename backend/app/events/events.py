from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class Event:
    pass

@dataclass
class MeetingProcessedEvent(Event):
    meeting_id: int
    project_name: str
    title: str
    summary: str
    extracted_data: Dict[str, Any]

@dataclass
class TaskAssignedEvent(Event):
    task_id: int
    project_name: str
    title: str
    assignee_name: str
    assignee_email: str
    due_date: Optional[str]

@dataclass
class CriticalEscalationEvent(Event):
    escalation_id: int
    project_name: str
    title: str
    assignee_name: str
    assignee_email: str
    severity: str

@dataclass
class DeadlineReminderEvent(Event):
    task_id: int
    project_name: str
    title: str
    assignee_name: str
    assignee_email: str
    due_date: str
