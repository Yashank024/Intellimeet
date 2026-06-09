import os
import json
import time
import logging
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Configure logger
logger = logging.getLogger("IntelliMeet.Gemini")
logging.basicConfig(level=logging.INFO)

load_dotenv()

def generate_content_with_retry(model, prompt, generation_config=None, max_retries=3, initial_delay=5):
    """
    Helper to execute Gemini generate_content with exponential backoff on 429 rate limit errors.
    """
    delay = initial_delay
    for attempt in range(max_retries):
        try:
            if generation_config:
                return model.generate_content(prompt, generation_config=generation_config)
            else:
                return model.generate_content(prompt)
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                logger.warning(f"Gemini API rate limit hit (429/ResourceExhausted). Retrying in {delay}s (Attempt {attempt+1}/{max_retries})...")
                time.sleep(delay)
                delay *= 2
            else:
                raise e
    # Final try
    if generation_config:
        return model.generate_content(prompt, generation_config=generation_config)
    else:
        return model.generate_content(prompt)

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            logger.warning("GEMINI_API_KEY is not set in environment variables.")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    def extract_structured_json(self, transcript: str) -> Dict[str, Any]:
        """
        Processes raw transcript using Gemini JSON Mode to extract tasks, risks, escalations, and decisions.
        """
        fallback_data = {
            "project_name": "Ingested Project",
            "date": "2026-06-09",
            "duration": "30 mins",
            "summary": "Meeting ingested but structured extraction failed.",
            "tasks": [],
            "risks": [],
            "escalations": [],
            "decisions": []
        }

        if not self.api_key:
            logger.error("Cannot call Gemini API - GEMINI_API_KEY is missing.")
            return fallback_data

        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            prompt_path = os.path.join(base_dir, "prompts", "extraction.txt")
            
            with open(prompt_path, "r", encoding="utf-8") as f:
                template = f.read()
            
            prompt = template.replace("{transcript}", transcript)
            
            logger.info(f"Invoking Gemini model '{self.model_name}' for transcript structured extraction...")
            model = genai.GenerativeModel(self.model_name)
            
            # Use retry helper
            response = generate_content_with_retry(
                model=model,
                prompt=prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                else:
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                raw_text = raw_text.strip()
                
            data = json.loads(raw_text)
            logger.info("Successfully received and parsed structured JSON from Gemini.")
            return data

        except Exception as e:
            logger.error(f"Error during Gemini structured extraction: {str(e)}", exc_info=True)
            return fallback_data
            
    def answer_query(self, context_chunks: List[str], question: str) -> str:
        """
        Synthesizes answers for complex reasoning / QA queries using ChromaDB and SQLite context chunks.
        """
        if not self.api_key:
            return "Gemini API key is not configured. Cannot perform reasoning."

        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            prompt_path = os.path.join(base_dir, "prompts", "qa.txt")
            
            with open(prompt_path, "r", encoding="utf-8") as f:
                template = f.read()
            
            context_str = "\n---\n".join(context_chunks)
            prompt = template.replace("{context}", context_str).replace("{question}", question)
            
            logger.info(f"Invoking Gemini model '{self.model_name}' for reasoning QA...")
            model = genai.GenerativeModel(self.model_name)
            
            # Use retry helper
            response = generate_content_with_retry(model=model, prompt=prompt)
            
            return response.text.strip()

        except Exception as e:
            logger.error(f"Error during Gemini reasoning QA: {str(e)}", exc_info=True)
            return f"Error executing reasoning query: {str(e)}"
