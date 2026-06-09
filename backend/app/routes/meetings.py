from fastapi import APIRouter, HTTPException
from database.db import SessionLocal
from database.models import Meeting, Task, Risk, Escalation, Decision

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.get("/")
async def get_meetings():
    session = SessionLocal()
    try:
        meetings = session.query(Meeting).order_by(Meeting.date.desc(), Meeting.id.desc()).all()
        return {"meetings": [{
            "id": m.id,
            "title": m.title,
            "project_name": m.project_name,
            "date": m.date,
            "duration": m.duration,
            "summary": m.summary,
            "transcript": m.transcript
        } for m in meetings]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@router.get("/{meeting_id}")
async def get_meeting_details(meeting_id: int):
    session = SessionLocal()
    try:
        meeting = session.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        meeting_dict = {
            "id": meeting.id,
            "title": meeting.title,
            "project_name": meeting.project_name,
            "date": meeting.date,
            "duration": meeting.duration,
            "summary": meeting.summary,
            "transcript": meeting.transcript
        }
        
        tasks = session.query(Task).filter(Task.meeting_id == meeting_id).all()
        risks = session.query(Risk).filter(Risk.meeting_id == meeting_id).all()
        escalations = session.query(Escalation).filter(Escalation.meeting_id == meeting_id).all()
        decisions = session.query(Decision).filter(Decision.meeting_id == meeting_id).all()
        
        def to_dict(rows):
            return [{col.name: getattr(r, col.name) for col in r.__table__.columns} for r in rows]
            
        return {
            "meeting": meeting_dict,
            "tasks": to_dict(tasks),
            "risks": to_dict(risks),
            "escalations": to_dict(escalations),
            "decisions": to_dict(decisions)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
