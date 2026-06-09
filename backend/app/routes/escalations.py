from fastapi import APIRouter, HTTPException, Query
from database.db import SessionLocal
from database.models import Project, Escalation, Risk, Task

router = APIRouter(prefix="/escalations", tags=["Escalations"])

@router.get("/")
async def get_escalations():
    session = SessionLocal()
    try:
        escalations = session.query(Escalation).order_by(Escalation.id.desc()).all()
        def to_dict(rows):
            return [{col.name: getattr(r, col.name) for col in r.__table__.columns} for r in rows]
        return {"escalations": to_dict(escalations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@router.put("/{escalation_id}/status")
async def update_escalation_status(escalation_id: int, status: str = Query(...)):
    session = SessionLocal()
    try:
        esc = session.query(Escalation).filter(Escalation.id == escalation_id).first()
        if not esc:
            raise HTTPException(status_code=404, detail="Escalation not found")
            
        project_name = esc.project_name
        esc.status = status
        session.commit()
        
        project = session.query(Project).filter(Project.name == project_name).first()
        if project:
            open_esc = session.query(Escalation).filter(Escalation.project_name == project_name, Escalation.status == 'Open').count()
            active_risks = session.query(Risk).filter(Risk.project_name == project_name, Risk.status == 'Active').count()
            open_tasks = session.query(Task).filter(Task.project_name == project_name, Task.status.in_(['Pending', 'Overdue'])).count()
            
            risk_score = (open_esc * 5) + (active_risks * 3) + (open_tasks * 2)
            
            proj_status = "On Track"
            if risk_score >= 15:
                proj_status = "High Risk"
            elif risk_score >= 5:
                proj_status = "Medium Risk"
                
            project.risk_score = risk_score
            project.status = proj_status
            session.commit()
        else:
            risk_score = 0
            proj_status = "On Track"
            
        return {
            "status": "success",
            "escalation_id": escalation_id,
            "new_status": status,
            "project_name": project_name,
            "new_project_risk_score": risk_score,
            "new_project_status": proj_status
        }
    except HTTPException as he:
        session.rollback()
        raise he
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
