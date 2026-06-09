import os
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from services.document_processor import DocumentProcessor
from services.extraction_service import ExtractionService

router = APIRouter(prefix="/upload", tags=["Upload"])
logger = logging.getLogger("IntelliMeet.UploadRoute")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

doc_processor = DocumentProcessor()
extraction_service = ExtractionService()

@router.post("/")
async def upload_meeting(
    title: str = Form(...),
    project: str = Form(...),
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    transcript_text = ""
    
    # 1. Handle File Upload if provided
    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        logger.info(f"Saving uploaded file to {file_path}")
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Extract text via document processor
            logger.info(f"Extracting text from file via document processor...")
            transcript_text = doc_processor.process_file(file_path)
            
            # Clean up the file after parsing
            if os.path.exists(file_path):
                os.remove(file_path)
                
        except Exception as e:
            logger.error(f"Error handling file upload/OCR: {str(e)}")
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")
            
    # 2. Fall back to raw copy-pasted text
    elif text:
        transcript_text = text.strip()
        
    else:
        raise HTTPException(
            status_code=400, 
            detail="No transcript content provided. Please upload a file or paste text."
        )

    if not transcript_text:
        raise HTTPException(
            status_code=400,
            detail="Extracted transcript is empty. Please verify the uploaded file contains readable content."
        )

    # 3. Process Ingestion & Persistent Storage
    try:
        logger.info(f"Triggering extraction pipeline for meeting title '{title}'...")
        result = extraction_service.process_transcript(title, transcript_text)
        return {
            "status": "success",
            "message": "Meeting successfully processed and saved.",
            "data": {
                "meeting_id": result["meeting_id"],
                "project_name": result["project_name"],
                "risk_score": result["risk_score"],
                "status": result["status"],
                "summary": result["summary"],
                "extracted_data": result["extracted_data"]
            }
        }
    except Exception as e:
        logger.error(f"Failed to process and store transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Extraction pipeline error: {str(e)}")

