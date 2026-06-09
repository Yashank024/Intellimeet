from fastapi import APIRouter
import os
import logging
from database.db import SessionLocal
from rag.chroma_service import ChromaService

logger = logging.getLogger("IntelliMeet.HealthRoute")
router = APIRouter(prefix="/system", tags=["System"])

@router.get("/health")
def health_check():
    """
    Validates connections to database, ChromaDB, and availability of keys.
    """
    db_status = "healthy"
    try:
        session = SessionLocal()
        session.execute("SELECT 1")
        session.close()
    except Exception as e:
        logger.error(f"Health check: Database connection failed: {e}")
        db_status = "unhealthy"

    chroma_status = "healthy"
    try:
        chroma = ChromaService()
        # Access collections to verify client response
        _ = chroma.collections.keys()
    except Exception as e:
        logger.error(f"Health check: ChromaDB persistent client failed: {e}")
        chroma_status = "unhealthy"

    gemini_status = "healthy" if os.getenv("GEMINI_API_KEY") else "unconfigured"
    resend_status = "healthy" if os.getenv("RESEND_API_KEY") else "simulated"

    # The background threads run on startup
    return {
        "status": "online",
        "database": db_status,
        "chromadb": chroma_status,
        "gemini": gemini_status,
        "resend": resend_status,
        "scheduler": "running"
    }
