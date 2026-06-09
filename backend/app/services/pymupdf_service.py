import fitz  # PyMuPDF
import logging

logger = logging.getLogger("IntelliMeet.PyMuPDF")

class PyMuPDFService:
    def extract_text(self, file_path: str) -> str:
        """
        Extracts raw text from a digital PDF using PyMuPDF (fitz).
        """
        try:
            logger.info(f"Opening PDF file via PyMuPDF: {file_path}")
            doc = fitz.open(file_path)
            text_lines = []
            for page in doc:
                text_lines.append(page.get_text())
            doc.close()
            extracted_text = "\n".join(text_lines).strip()
            logger.info(f"PyMuPDF successfully extracted {len(extracted_text)} characters.")
            return extracted_text
        except Exception as e:
            logger.error(f"Failed to parse PDF with PyMuPDF: {str(e)}")
            return ""
