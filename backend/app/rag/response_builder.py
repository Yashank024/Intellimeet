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

    def format_sql_facts(self, result_type: str, data: List[Dict[str, Any]]) -> str:
        """
        Formats SQLite table rows into a plain-text context block of facts.
        """
        if not data:
            return f"No records found in database for {result_type}."
            
        lines = [f"Retrieved SQL Facts ({result_type}):"]
        for row in data:
            if result_type == "tasks":
                lines.append(
                    f"- Task ID {row.get('id')}: \"{row.get('title')}\" | "
                    f"Assigned to: {row.get('assigned_to')} | "
                    f"Due Date: {row.get('due_date')} | "
                    f"Status: {row.get('status')} | "
                    f"Project: {row.get('project_name')} | "
                    f"Source Text: \"{row.get('source_text')}\""
                )
            elif result_type == "escalations":
                lines.append(
                    f"- Escalation ID {row.get('id')}: \"{row.get('title')}\" | "
                    f"Assigned to: {row.get('assigned_to')} | "
                    f"Severity: {row.get('severity')} | "
                    f"Status: {row.get('status')} | "
                    f"Project: {row.get('project_name')} | "
                    f"Source Text: \"{row.get('source_text')}\""
                )
            elif result_type == "risks":
                lines.append(
                    f"- Risk ID {row.get('id')}: \"{row.get('title')}\" | "
                    f"Severity: {row.get('severity')} | "
                    f"Status: {row.get('status')} | "
                    f"Mitigation: {row.get('mitigation_plan')} | "
                    f"Project: {row.get('project_name')} | "
                    f"Source Text: \"{row.get('source_text')}\""
                )
            elif result_type == "decisions":
                lines.append(
                    f"- Decision ID {row.get('id')}: \"{row.get('title')}\" | "
                    f"Context: {row.get('context')} | "
                    f"Project: {row.get('project_name')} | "
                    f"Source Text: \"{row.get('source_text')}\""
                )
            elif result_type == "meetings":
                lines.append(
                    f"- Meeting ID {row.get('id')}: \"{row.get('title')}\" | "
                    f"Project: {row.get('project_name')} | "
                    f"Date: {row.get('date')} | "
                    f"Duration: {row.get('duration')} | "
                    f"Summary: \"{row.get('summary')}\""
                )
            elif result_type == "projects":
                lines.append(
                    f"- Project ID {row.get('id')}: \"{row.get('name')}\" | "
                    f"Risk Score: {row.get('risk_score')} | "
                    f"Status: {row.get('status')}"
                )
            elif result_type == "count":
                lines.append(f"- Count: {row.get('count')} | Description: {row.get('label')}")
            else:
                items = [f"{k}: {v}" for k, v in row.items()]
                lines.append(f"- Record: " + ", ".join(items))
                
        return "\n".join(lines)

    def format_chroma_context(self, results: List[Dict[str, Any]]) -> str:
        """
        Formats list of ChromaDB document matches into plain-text context paragraphs.
        """
        if not results:
            return "No matching semantic results found in vector space."
            
        lines = ["Retrieved Chroma Context:"]
        for idx, res in enumerate(results):
            meta = res.get("metadata", {})
            project = meta.get("project_name", "Unknown")
            title = meta.get("title", "Meeting")
            date = meta.get("date", "N/A")
            document = res.get("document", "").strip()
            
            lines.append(
                f"{idx+1}. Project: {project} | Meeting: {title} ({date}) | "
                f"Excerpt: \"{document}\""
            )
        return "\n".join(lines)

