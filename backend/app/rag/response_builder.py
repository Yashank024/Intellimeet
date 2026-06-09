import logging
from typing import List, Dict, Any
from services.gemini_service import GeminiService

logger = logging.getLogger("IntelliMeet.ResponseBuilder")

class ResponseBuilder:
    def __init__(self):
        self.gemini_service = GeminiService()

    def build_synthesized_response(self, query: str, context_chunks: List[str]) -> str:
        """
        Invokes Gemini to synthesize a narrative, reasoning answer based on context chunks.
        """
        if not context_chunks:
            return "No matching context was found to synthesize an answer."
        return self.gemini_service.answer_query(context_chunks, query)

    def build_semantic_response(self, results: List[Dict[str, Any]]) -> str:
        """
        Formats list of ChromaDB document matches into markdown format.
        """
        if not results:
            return "No matching semantic results found in ChromaDB vector space."
            
        md = "### ChromaDB Semantic Vector Matches\n\n"
        for idx, res in enumerate(results):
            meta = res.get("metadata", {})
            project = meta.get("project_name", "Unknown")
            title = meta.get("title", "Meeting")
            date = meta.get("date", "N/A")
            
            md += f"{idx+1}. **Project**: {project} | **Meeting**: {title} ({date})\n"
            md += f"   > *\"{res.get('document', '')}\"*\n\n"
        return md

    def build_sql_response(self, result_type: str, data: List[Dict[str, Any]]) -> str:
        """
        Formats relational table rows into structured markdown tables.
        """
        if not data:
            return f"No records found in SQLite for {result_type}."
            
        md = f"### SQLite Relational Facts ({result_type.capitalize()})\n\n"
        
        if result_type == "tasks":
            md += "| ID | Title | Assignee | Due Date | Status | Project | Source Transcript Snippet |\n"
            md += "|---|---|---|---|---|---|---|\n"
            for row in data:
                md += f"| {row.get('id')} | {row.get('title')} | {row.get('assigned_to')} | {row.get('due_date')} | {row.get('status')} | {row.get('project_name')} | *\"{row.get('source_text')}\"* |\n"
        elif result_type == "escalations":
            md += "| ID | Title | Assigned To | Severity | Status | Project | Source Transcript Snippet |\n"
            md += "|---|---|---|---|---|---|---|\n"
            for row in data:
                md += f"| {row.get('id')} | {row.get('title')} | {row.get('assigned_to')} | {row.get('severity')} | {row.get('status')} | {row.get('project_name')} | *\"{row.get('source_text')}\"* |\n"
        elif result_type == "risks":
            md += "| ID | Title | Severity | Status | Mitigation Plan | Project | Source Transcript Snippet |\n"
            md += "|---|---|---|---|---|---|---|\n"
            for row in data:
                md += f"| {row.get('id')} | {row.get('title')} | {row.get('severity')} | {row.get('status')} | {row.get('mitigation_plan')} | {row.get('project_name')} | *\"{row.get('source_text')}\"* |\n"
        elif result_type == "decisions":
            md += "| ID | Decision | Context | Project | Source Transcript Snippet |\n"
            md += "|---|---|---|---|---|\n"
            for row in data:
                md += f"| {row.get('id')} | {row.get('title')} | {row.get('context')} | {row.get('project_name')} | *\"{row.get('source_text')}\"* |\n"
        else:
            for row in data:
                items = [f"**{k}**: {v}" for k, v in row.items()]
                md += f"- " + ", ".join(items) + "\n"
        return md
