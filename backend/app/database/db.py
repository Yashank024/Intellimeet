import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from database.models import Base

DB_PATH = "meeting_data.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create SQLite engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Enforce foreign key constraints inside SQLite via event listener
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Database:
    @staticmethod
    def get_db():
        """
        Dependency generator yielding an active SQLAlchemy session.
        """
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    @staticmethod
    def initialize_schema():
        """
        Initializes schema metadata mapping declarations directly in SQLite.
        """
        Base.metadata.create_all(bind=engine)
