from fastapi import APIRouter, HTTPException
from database.db import SessionLocal
from database.models import Meeting, Task, Escalation, Risk, Project

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
async def get_dashboard_stats():
    """
    Returns aggregated statistics for the executive dashboard cards.
    Counts are computed directly from SQLite via SQLAlchemy.
    """
    session = SessionLocal()
    try:
        total_meetings = session.query(Meeting).count()
        open_tasks = session.query(Task).filter(Task.status == "Pending").count()
        overdue_tasks = session.query(Task).filter(Task.status == "Overdue").count()
        open_escalations = session.query(Escalation).filter(Escalation.status == "Open").count()
        active_risks = session.query(Risk).filter(Risk.status == "Active").count()
        high_risk_projects = session.query(Project).filter(Project.risk_score >= 15).count()

        return {
            "total_meetings": total_meetings,
            "open_tasks": open_tasks,
            "overdue_tasks": overdue_tasks,
            "open_escalations": open_escalations,
            "active_risks": active_risks,
            "high_risk_projects": high_risk_projects,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
