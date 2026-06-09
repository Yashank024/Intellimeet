import time
import logging
import threading
from datetime import datetime, timedelta

logger = logging.getLogger("IntelliMeet.DeadlineScheduler")


def _run_deadline_check():
    """
    Checks for tasks due within the next 24 hours and publishes DeadlineReminderEvents.
    Runs in a daemon thread — import is deferred to avoid circular imports at module load time.
    """
    # Deferred imports to avoid circular dependency on startup
    from database.db import SessionLocal
    from database.models import Task, Employee
    from events.dispatcher import EventDispatcher
    from events.events import DeadlineReminderEvent

    dispatcher = EventDispatcher()
    session = SessionLocal()
    try:
        now = datetime.utcnow()
        window_end = now + timedelta(hours=24)

        # Fetch all non-completed tasks with a due_date
        tasks = session.query(Task).filter(
            Task.status.in_(["Pending", "Overdue"]),
            Task.due_date.isnot(None)
        ).all()

        reminders_sent = 0
        for task in tasks:
            try:
                due_dt = datetime.strptime(task.due_date, "%Y-%m-%d")
            except (ValueError, TypeError):
                continue

            if now <= due_dt <= window_end:
                # Resolve employee email
                employee = session.query(Employee).filter(
                    Employee.name == task.assigned_to
                ).first()
                assignee_email = employee.email if employee else "yashank@intellimeet.com"
                assignee_name = task.assigned_to or "Team Member"

                event = DeadlineReminderEvent(
                    task_id=task.id,
                    project_name=task.project_name or "General",
                    title=task.title,
                    assignee_name=assignee_name,
                    assignee_email=assignee_email,
                    due_date=task.due_date
                )
                dispatcher.publish(event)
                reminders_sent += 1
                logger.info(f"[DeadlineScheduler] Reminder queued for task '{task.title}' (due: {task.due_date})")

        logger.info(f"[DeadlineScheduler] Cycle complete. {reminders_sent} reminder(s) published.")
    except Exception as e:
        logger.error(f"[DeadlineScheduler] Error during deadline check cycle: {e}", exc_info=True)
    finally:
        session.close()


def _scheduler_loop(interval_seconds: int):
    """
    Infinite loop that runs the deadline check on a fixed interval.
    """
    logger.info(f"[DeadlineScheduler] Background scheduler started. Interval: {interval_seconds}s.")
    while True:
        try:
            _run_deadline_check()
        except Exception as e:
            logger.error(f"[DeadlineScheduler] Unexpected error in scheduler loop: {e}", exc_info=True)
        time.sleep(interval_seconds)


def start_deadline_scheduler(interval_seconds: int = 3600):
    """
    Launches the deadline reminder scheduler in a background daemon thread.
    Call this once at FastAPI startup. Daemon=True means it dies with the server.
    """
    thread = threading.Thread(
        target=_scheduler_loop,
        args=(interval_seconds,),
        daemon=True,
        name="DeadlineReminderScheduler"
    )
    thread.start()
    logger.info(f"[DeadlineScheduler] Daemon thread launched (interval={interval_seconds}s).")
