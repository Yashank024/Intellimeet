def get_task_assigned_html(assignee_name: str, project_name: str, task_title: str, due_date: str) -> str:
    """
    Returns HTML template for a new task assignment email notification.
    """
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">IntelliMeet Task Assignment</h2>
                <p>Hello <strong>{assignee_name}</strong>,</p>
                <p>You have been assigned a new action item from a recent meeting project: <strong>{project_name}</strong>.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <p style="margin: 0 0 8px 0;"><strong>Task Description:</strong> {task_title}</p>
                    <p style="margin: 0;"><strong>Due Date:</strong> {due_date if due_date else 'No set date (ASAP)'}</p>
                </div>
                
                <p>Please log in to the IntelliMeet Dashboard to view your checklist and update progress.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated notification from IntelliMeet.</p>
            </div>
        </body>
    </html>
    """


def get_escalation_assigned_html(assignee_name: str, project_name: str, esc_title: str, severity: str) -> str:
    """
    Returns HTML template for a new critical escalation email notification.
    """
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #ef4444; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">IntelliMeet Escalation Alert</h2>
                <p>Hello <strong>{assignee_name}</strong>,</p>
                <p>A new high-priority issue has been escalated to your attention in project: <strong>{project_name}</strong>.</p>
                
                <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ef4444;">
                    <p style="margin: 0 0 8px 0; color: #991b1b;"><strong>Escalation:</strong> {esc_title}</p>
                    <p style="margin: 0; color: #991b1b;"><strong>Severity:</strong> <span style="background-color: #fee2e2; padding: 2px 6px; border-radius: 4px; font-weight: bold;">{severity}</span></p>
                </div>
                
                <p>Please log in to the IntelliMeet Dashboard to review the resolution status.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated notification from IntelliMeet.</p>
            </div>
        </body>
    </html>
    """


def get_deadline_reminder_html(assignee_name: str, project_name: str, task_title: str, due_date: str) -> str:
    """
    Returns HTML template for a task deadline reminder email (24h before due).
    """
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #f59e0b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">&#9200; IntelliMeet Deadline Reminder</h2>
                <p>Hello <strong>{assignee_name}</strong>,</p>
                <p>A task assigned to you in project <strong>{project_name}</strong> is due within <strong>24 hours</strong>.</p>
                
                <div style="background-color: #fffbeb; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0 0 8px 0;"><strong>Task:</strong> {task_title}</p>
                    <p style="margin: 0; color: #b45309;"><strong>Due Date:</strong> <span style="font-weight: bold;">{due_date}</span></p>
                </div>
                
                <p>Please log in to the IntelliMeet Dashboard to complete or update this task before the deadline.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated deadline reminder from IntelliMeet.</p>
            </div>
        </body>
    </html>
    """
