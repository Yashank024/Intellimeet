from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Employee(Base):
    __tablename__ = 'employees'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    email = Column(String(100), nullable=False, unique=True)
    role = Column(String(100), nullable=False)
    team = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, unique=True)
    risk_score = Column(Integer, default=0)
    status = Column(String(50), default='On Track')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Meeting(Base):
    __tablename__ = 'meetings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    project_name = Column(String(200), ForeignKey('projects.name', ondelete='CASCADE'), nullable=False)
    date = Column(String(50), nullable=False)
    duration = Column(String(50))
    summary = Column(Text)
    transcript = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(Integer, ForeignKey('meetings.id', ondelete='CASCADE'))
    project_name = Column(String(200), ForeignKey('projects.name', ondelete='CASCADE'), nullable=False)
    title = Column(String(500), nullable=False)
    assigned_to = Column(String(100), ForeignKey('employees.name', ondelete='SET NULL'))
    due_date = Column(String(50))
    status = Column(String(50), default='Pending')
    source_chunk_id = Column(Integer)
    source_text = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Risk(Base):
    __tablename__ = 'risks'

    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(Integer, ForeignKey('meetings.id', ondelete='CASCADE'))
    project_name = Column(String(200), ForeignKey('projects.name', ondelete='CASCADE'), nullable=False)
    title = Column(String(500), nullable=False)
    severity = Column(String(50))
    status = Column(String(50), default='Active')
    mitigation_plan = Column(Text)
    source_chunk_id = Column(Integer)
    source_text = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Escalation(Base):
    __tablename__ = 'escalations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(Integer, ForeignKey('meetings.id', ondelete='CASCADE'))
    project_name = Column(String(200), ForeignKey('projects.name', ondelete='CASCADE'), nullable=False)
    title = Column(String(500), nullable=False)
    severity = Column(String(50))
    status = Column(String(50), default='Open')
    assigned_to = Column(String(100), ForeignKey('employees.name', ondelete='SET NULL'))
    source_chunk_id = Column(Integer)
    source_text = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Decision(Base):
    __tablename__ = 'decisions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(Integer, ForeignKey('meetings.id', ondelete='CASCADE'))
    project_name = Column(String(200), ForeignKey('projects.name', ondelete='CASCADE'), nullable=False)
    title = Column(String(500), nullable=False)
    context = Column(Text)
    source_chunk_id = Column(Integer)
    source_text = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
