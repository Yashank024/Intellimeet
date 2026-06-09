from pydantic import BaseModel, EmailStr
from typing import Optional, List

class MeetingCreate(BaseModel):
    title: str
    project_name: str
    date: str
    duration: Optional[str] = None
    summary: Optional[str] = None
    transcript: Optional[str] = None

class TaskUpdate(BaseModel):
    status: str

class EscalationUpdate(BaseModel):
    status: str

class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "Gemini 2.5 Flash"

class EmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    body: str

