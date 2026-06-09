import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import Database
from database.seed import seed_db
from routes import upload, meetings, risks, escalations, chat, dashboard, health
from events.dispatcher import setup_event_listeners
from services.deadline_scheduler import start_deadline_scheduler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IntelliMeet.Main")

app = FastAPI(
    title="IntelliMeet API",
    description="Intelligent Meeting Intelligence & Escalation Tracking System API Backend",
    version="1.0.0"
)

# Configure CORS for Next.js frontend local development ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_setup():
    logger.info("Initializing database schemas...")
    Database.initialize_schema()
    logger.info("Database schemas initialized. Running seed scripts...")
    seed_db()
    logger.info("Bootstrapping event listeners...")
    setup_event_listeners()
    logger.info("Starting deadline reminder scheduler daemon...")
    start_deadline_scheduler(interval_seconds=3600)
    logger.info("Startup boot verification complete.")

# Include routes under prefix "/api"
app.include_router(upload.router, prefix="/api")
app.include_router(meetings.router, prefix="/api")
app.include_router(risks.router, prefix="/api")
app.include_router(escalations.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(health.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "online", "system": "IntelliMeet Ingestion Engine"}



