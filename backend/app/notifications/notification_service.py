import logging
from notifications.resend_service import ResendService
from notifications.templates import get_task_assigned_html, get_escalation_assigned_html, get_deadline_reminder_html

logger = logging.getLogger("IntelliMeet.NotificationService")

class NotificationService:
    def __init__(self):
        self.resend_service = ResendService()

    def send_task_assigned_email(self, assignee_email: str, assignee_name: str, task_title: str, due_date: str, project_name: str) -> bool:
        """
        Sends an email alert when a new task is assigned to an employee.
        """
        subject = f"NEW TASK: '{task_title}' assigned to you on {project_name}"
        html_content = get_task_assigned_html(assignee_name, project_name, task_title, due_date)
        return self.resend_service.send_email(assignee_email, subject, html_content)

    def send_escalation_assigned_email(self, assignee_email: str, assignee_name: str, esc_title: str, severity: str, project_name: str) -> bool:
        """
        Sends an email alert when a project escalation is assigned.
        """
        subject = f"CRITICAL ESCALATION: '{esc_title}' assigned to you on {project_name}"
        html_content = get_escalation_assigned_html(assignee_name, project_name, esc_title, severity)
        return self.resend_service.send_email(assignee_email, subject, html_content)

    def send_deadline_reminder_email(self, assignee_email: str, assignee_name: str, task_title: str, due_date: str, project_name: str) -> bool:
        """
        Sends a reminder email when a task deadline is within 24 hours.
        """
        subject = f"DEADLINE REMINDER: '{task_title}' is due soon on {project_name}"
        html_content = get_deadline_reminder_html(assignee_name, project_name, task_title, due_date)
        return self.resend_service.send_email(assignee_email, subject, html_content)
