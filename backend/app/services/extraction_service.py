import logging
from typing import Dict, Any, List
from database.db import SessionLocal
from database.models import Employee, Project, Meeting, Task, Risk, Escalation, Decision
from services.gemini_service import GeminiService
from rag.chroma_service import ChromaService
from rag.chunker import chunk_transcript, find_source_chunk_index
from events.events import MeetingProcessedEvent, TaskAssignedEvent, CriticalEscalationEvent
from events.dispatcher import EventDispatcher

logger = logging.getLogger("IntelliMeet.Extraction")

class ExtractionService:
    def __init__(self):
        self.gemini_service = GeminiService()
        self.chroma_service = ChromaService()
        self.event_dispatcher = EventDispatcher()

    def process_transcript(self, title: str, raw_text: str) -> Dict[str, Any]:
        """
        Runs the full extraction pipeline using SQLAlchemy ORM.
        """
        # 1. Parse using Gemini Service
        data = self.gemini_service.extract_structured_json(raw_text)
        
        project_name = data.get("project_name", "Default Project")
        meeting_date = data.get("date", "2026-06-09")
        duration = data.get("duration", "30 mins")
        summary = data.get("summary", "")
        
        # 2. Chunk Transcript
        chunks = chunk_transcript(raw_text)
        if not chunks:
            chunks = [raw_text]
            
        session = SessionLocal()
        
        try:
            # 3. Get or Create Project
            project = session.query(Project).filter(Project.name == project_name).first()
            if not project:
                logger.info(f"Creating new project in SQLite via ORM: {project_name}")
                project = Project(name=project_name, risk_score=0, status='On Track')
                session.add(project)
                session.flush() # ensure ID generation
            
            # 4. Create Meeting Record
            meeting = Meeting(
                title=title,
                project_name=project_name,
                date=meeting_date,
                duration=duration,
                summary=summary,
                transcript=raw_text
            )
            session.add(meeting)
            session.flush() # generate meeting.id
            meeting_id = meeting.id
            
            # Index chunks in ChromaDB
            chroma_metadata = {
                "project_name": project_name,
                "title": title,
                "date": meeting_date
            }
            self.chroma_service.add_meeting_chunks(meeting_id, chunks, chroma_metadata)
            
            # Index summary in ChromaDB
            self.chroma_service.add_item_to_collection(
                "meeting_summaries",
                f"summary_{meeting_id}",
                summary,
                {**chroma_metadata, "meeting_id": meeting_id}
            )
            
            # Helper to get or auto-create employee
            def get_or_create_employee(emp_name: str) -> Employee:
                clean_name = emp_name.strip()
                emp = session.query(Employee).filter(Employee.name.ilike(clean_name)).first()
                if emp:
                    return emp
                
                email = clean_name.lower().replace(" ", "") + "@intellimeet.com"
                logger.info(f"Auto-creating employee: {clean_name}")
                new_emp = Employee(name=clean_name, email=email, role="Developer", team="Engineering")
                session.add(new_emp)
                session.flush()
                return new_emp

            # Events list to publish after database transaction commit
            events_to_publish = []

            # 5. Insert Extracted Tasks
            tasks_list = data.get("tasks", [])
            for idx, t in enumerate(tasks_list):
                task_title = t.get("title", "")
                assigned_name_raw = t.get("assigned_to", "")
                assigned_emp = get_or_create_employee(assigned_name_raw) if assigned_name_raw else None
                due_date = t.get("due_date")
                source_text = t.get("source_text", "")
                source_chunk_idx = find_source_chunk_index(source_text, chunks)
                
                new_task = Task(
                    meeting_id=meeting_id,
                    project_name=project_name,
                    title=task_title,
                    assigned_to=assigned_emp.name if assigned_emp else None,
                    due_date=due_date,
                    status='Pending',
                    source_chunk_id=source_chunk_idx,
                    source_text=source_text
                )
                session.add(new_task)
                session.flush()
                
                if assigned_emp:
                    events_to_publish.append(TaskAssignedEvent(
                        task_id=new_task.id,
                        project_name=project_name,
                        title=task_title,
                        assignee_name=assigned_emp.name,
                        assignee_email=assigned_emp.email,
                        due_date=due_date
                    ))
                
            # 6. Insert Extracted Risks & Index in ChromaDB
            risks_list = data.get("risks", [])
            for idx, r in enumerate(risks_list):
                risk_title = r.get("title", "")
                severity = r.get("severity", "Low")
                mitigation_plan = r.get("mitigation_plan", "")
                source_text = r.get("source_text", "")
                source_chunk_idx = find_source_chunk_index(source_text, chunks)
                
                new_risk = Risk(
                    meeting_id=meeting_id,
                    project_name=project_name,
                    title=risk_title,
                    severity=severity,
                    status='Active',
                    mitigation_plan=mitigation_plan,
                    source_chunk_id=source_chunk_idx,
                    source_text=source_text
                )
                session.add(new_risk)
                
                # Index in ChromaDB
                risk_id = f"risk_{meeting_id}_{idx}"
                self.chroma_service.add_item_to_collection(
                    "risks",
                    risk_id,
                    risk_title,
                    {
                        "project_name": project_name,
                        "meeting_id": meeting_id,
                        "severity": severity,
                        "mitigation_plan": mitigation_plan,
                        "source_chunk_id": source_chunk_idx
                    }
                )
                
            # 7. Insert Extracted Escalations, Index in ChromaDB, & Event Dispatch
            esc_list = data.get("escalations", [])
            for idx, e in enumerate(esc_list):
                esc_title = e.get("title", "")
                severity = e.get("severity", "Medium")
                assigned_name_raw = e.get("assigned_to", "")
                assigned_emp = get_or_create_employee(assigned_name_raw) if assigned_name_raw else None
                source_text = e.get("source_text", "")
                source_chunk_idx = find_source_chunk_index(source_text, chunks)
                
                new_esc = Escalation(
                    meeting_id=meeting_id,
                    project_name=project_name,
                    title=esc_title,
                    severity=severity,
                    status='Open',
                    assigned_to=assigned_emp.name if assigned_emp else None,
                    source_chunk_id=source_chunk_idx,
                    source_text=source_text
                )
                session.add(new_esc)
                session.flush()
                
                # Index in ChromaDB
                esc_id = f"esc_{meeting_id}_{idx}"
                self.chroma_service.add_item_to_collection(
                    "escalations",
                    esc_id,
                    esc_title,
                    {
                        "project_name": project_name,
                        "meeting_id": meeting_id,
                        "severity": severity,
                        "assigned_to": assigned_emp.name if assigned_emp else "",
                        "source_chunk_id": source_chunk_idx
                    }
                )
                
                if assigned_emp:
                    events_to_publish.append(CriticalEscalationEvent(
                        escalation_id=new_esc.id,
                        project_name=project_name,
                        title=esc_title,
                        assignee_name=assigned_emp.name,
                        assignee_email=assigned_emp.email,
                        severity=severity
                    ))
                
            # 8. Insert Extracted Decisions & Index in ChromaDB
            dec_list = data.get("decisions", [])
            for idx, d in enumerate(dec_list):
                dec_title = d.get("title", "")
                context = d.get("context", "")
                source_text = d.get("source_text", "")
                source_chunk_idx = find_source_chunk_index(source_text, chunks)
                
                new_dec = Decision(
                    meeting_id=meeting_id,
                    project_name=project_name,
                    title=dec_title,
                    context=context,
                    source_chunk_id=source_chunk_idx,
                    source_text=source_text
                )
                session.add(new_dec)
                
                # Index in ChromaDB
                dec_id = f"dec_{meeting_id}_{idx}"
                self.chroma_service.add_item_to_collection(
                    "decisions",
                    dec_id,
                    dec_title,
                    {
                        "project_name": project_name,
                        "meeting_id": meeting_id,
                        "context": context,
                        "source_chunk_id": source_chunk_idx
                    }
                )
                
            # 9. Commit database transaction
            session.commit()
            
            # Recalculate project risk scores out-of-transaction
            self.recalculate_project_score(session, project_name)
            
            # Publish general meeting processed event
            events_to_publish.append(MeetingProcessedEvent(
                meeting_id=meeting_id,
                project_name=project_name,
                title=title,
                summary=summary,
                extracted_data=data
            ))
            
            # 10. Decoupled asynchronous event dispatches
            for event in events_to_publish:
                self.event_dispatcher.publish(event)
                
            return {
                "meeting_id": meeting_id,
                "project_name": project_name,
                "risk_score": project.risk_score,
                "status": project.status,
                "summary": summary,
                "extracted_data": data
            }

        except Exception as ex:
            session.rollback()
            logger.error(f"Failed to process meeting via ORM, rolled back: {str(ex)}")
            raise ex
        finally:
            session.close()

    def recalculate_project_score(self, session, project_name: str):
        """
        Recalculates a project's risk score and updates the status.
        """
        try:
            project = session.query(Project).filter(Project.name == project_name).first()
            if not project:
                return
                
            open_esc = session.query(Escalation).filter(Escalation.project_name == project_name, Escalation.status == 'Open').count()
            active_risks = session.query(Risk).filter(Risk.project_name == project_name, Risk.status == 'Active').count()
            open_tasks = session.query(Task).filter(Task.project_name == project_name, Task.status.in_(['Pending', 'Overdue'])).count()
            
            risk_score = (open_esc * 5) + (active_risks * 3) + (open_tasks * 2)
            
            status = "On Track"
            if risk_score >= 15:
                status = "High Risk"
            elif risk_score >= 5:
                status = "Medium Risk"
                
            project.risk_score = risk_score
            project.status = status
            session.commit()
            logger.info(f"ORM Recalculated project '{project_name}' risk score: {risk_score} ({status})")
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to recalculate project risk scores: {e}")
