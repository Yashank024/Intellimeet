import os
import logging
from services.pymupdf_service import PyMuPDFService
from services.paddleocr_service import PaddleOCRService

logger = logging.getLogger("IntelliMeet.DocumentProcessor")

class DocumentProcessor:
    def __init__(self):
        self.pymupdf_service = PyMuPDFService()
        self.paddleocr_service = PaddleOCRService()

    def process_file(self, file_path: str) -> str:
        """
        Process PDF, TXT, or Image files.
        If PDF, first try extracting text using PyMuPDF (digital).
        If the extracted text is empty/insufficient, convert pages to images and run PaddleOCR (scanned).
        If Image, run PaddleOCR.
        If TXT, read directly.
        """
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return ""

        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".txt":
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return f.read().strip()
            except Exception as e:
                logger.error(f"Failed to read TXT file {file_path}: {e}")
                return ""

        elif ext == ".pdf":
            # 1. Try PyMuPDF
            digital_text = self.pymupdf_service.extract_text(file_path)
            # Check if we extracted meaningful content (more than just whitespace/special chars)
            clean_text = digital_text.strip()
            if len(clean_text) > 100:  # arbitrary threshold for digital text
                logger.info("Successfully extracted digital text from PDF using PyMuPDF.")
                return clean_text
            
            logger.info("PDF has very little or no digital text. Treating as scanned PDF and falling back to OCR.")
            # 2. Treat as scanned PDF: extract images of pages and run PaddleOCR
            try:
                import fitz
                doc = fitz.open(file_path)
                ocr_texts = []
                temp_images = []
                for i, page in enumerate(doc):
                    pix = page.get_pixmap(dpi=150)
                    temp_img_path = f"{file_path}_page_{i}.png"
                    pix.save(temp_img_path)
                    temp_images.append(temp_img_path)
                    
                    page_text = self.paddleocr_service.extract_text(temp_img_path)
                    if page_text:
                        ocr_texts.append(page_text)
                        
                # Clean up temp images
                for img_path in temp_images:
                    if os.path.exists(img_path):
                        os.remove(img_path)
                        
                doc.close()
                combined_ocr_text = "\n\n".join(ocr_texts).strip()
                logger.info(f"Successfully extracted OCR text from scanned PDF. Length: {len(combined_ocr_text)}")
                return combined_ocr_text
            except Exception as e:
                logger.error(f"Error doing OCR on PDF: {e}")
                # Fallback to whatever PyMuPDF extracted if any
                return digital_text

        elif ext in [".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"]:
            return self.paddleocr_service.extract_text(file_path)

        else:
            logger.warning(f"Unsupported file extension: {ext}. Attempting raw read.")
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read().strip()
            except Exception as e:
                logger.error(f"Failed to read file as text: {e}")
                return ""
