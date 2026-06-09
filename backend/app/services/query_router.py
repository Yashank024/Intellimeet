import re
import logging
from typing import Dict, Any, List
from database.db import SessionLocal
from database.models import Project, Meeting, Task, Risk, Escalation, Decision
from rag.retriever import Retriever
from rag.response_builder import ResponseBuilder
from rag.context_builder import build_compressed_context

logger = logging.getLogger("IntelliMeet.QueryRouter")


# ---------------------------------------------------------------------------
# Intent Classification Constants
# ---------------------------------------------------------------------------

# These words indicate a factual lookup that can be answered from SQLite.
# Even if "how" or "why" appears alongside these, SQL wins if it matches first.
_SQL_SUBJECT_WORDS = {
    "task", "tasks", "todo", "action", "checklist",
    "escalation", "escalations", "blocker", "blockers",
    "risk", "risks", "threat",
    "decision", "decisions",
    "meeting", "meetings",
    "project", "projects",
}

# Single-word SQL verbs (checked against tokenised word set)
_SQL_INTENT_WORDS = {
    "show", "list", "count", "get", "fetch",
    "pending", "completed", "done", "open", "closed", "resolved",
    "assigned", "due", "overdue", "deadline",
    "who", "which",
}

# Multi-word SQL phrases (checked as substrings in lowercased query)
_SQL_INTENT_PHRASES = [
    "how many", "how much",
]

# Semantic intent — questions about what was discussed in meetings.
_SEMANTIC_INTENT_PHRASES = {
    "discussed", "mentioned", "mention", "talked about", "said", "raised",
    "conversation about", "meeting about", "discussion on",
}

# ONLY these words alone trigger Gemini reasoning — everything else is SQL or Semantic.
_REASONING_EXCLUSIVE_WORDS = {
    "why", "analyze", "analyse", "summarize", "summarise",
    "compare", "recommend", "predict", "impact", "assess",
    "explain the reason", "root cause",
}


# ---------------------------------------------------------------------------
# SQL Query Interpreter
# ---------------------------------------------------------------------------

class SQLQueryInterpreter:
    @staticmethod
    def interpret_and_execute(query: str) -> Dict[str, Any]:
        """
        Parses natural language queries and translates them to SQLAlchemy ORM filters.
        Returns structured result data directly from SQLite.
        """
        query_lower = query.lower()
        session = SessionLocal()

        result_type = ""
        rows = []
        sql_trace = ""

        try:
            if any(w in query_lower for w in ["task", "todo", "action item", "checklist"]):
                result_type = "tasks"
                q = session.query(Task)

                names = ["yashank", "rahul", "priya", "amit"]
                for name in names:
                    if name in query_lower:
                        q = q.filter(Task.assigned_to.ilike(f"%{name}%"))

                if "pending" in query_lower or "open" in query_lower:
                    q = q.filter(Task.status == "Pending")
                elif any(w in query_lower for w in ["completed", "done", "closed", "finished"]):
                    q = q.filter(Task.status == "Completed")
                elif "overdue" in query_lower:
                    q = q.filter(Task.status == "Overdue")

                projects = [p.name for p in session.query(Project).all()]
                for p in projects:
                    if p.lower() in query_lower:
                        q = q.filter(Task.project_name == p)

                # COUNT queries
                if any(w in query_lower for w in ["how many", "count"]):
                    count = q.count()
                    return {
                        "success": True,
                        "sql_query": "SELECT COUNT(*) FROM tasks WHERE ...",
                        "sql_params": [],
                        "result_type": "count",
                        "data": [{"count": count, "label": "Tasks matching query"}],
                    }

                tasks = q.order_by(Task.id.desc()).limit(15).all()
                rows = [
                    {
                        "id": t.id,
                        "title": t.title,
                        "assigned_to": t.assigned_to,
                        "due_date": t.due_date,
                        "status": t.status,
                        "project_name": t.project_name,
                        "source_text": t.source_text,
                    }
                    for t in tasks
                ]
                sql_trace = "SELECT * FROM tasks WHERE ... LIMIT 15"

            elif any(w in query_lower for w in ["escalation", "blocker", "issue"]):
                result_type = "escalations"
                q = session.query(Escalation)

                names = ["yashank", "rahul", "priya", "amit"]
                for name in names:
                    if name in query_lower:
                        q = q.filter(Escalation.assigned_to.ilike(f"%{name}%"))

                if "pending" in query_lower or "open" in query_lower:
                    q = q.filter(Escalation.status == "Open")
                elif any(w in query_lower for w in ["completed", "resolved", "closed"]):
                    q = q.filter(Escalation.status == "Resolved")

                projects = [p.name for p in session.query(Project).all()]
                for p in projects:
                    if p.lower() in query_lower:
                        q = q.filter(Escalation.project_name == p)

                if any(w in query_lower for w in ["how many", "count"]):
                    count = q.count()
                    return {
                        "success": True,
                        "sql_query": "SELECT COUNT(*) FROM escalations WHERE ...",
                        "sql_params": [],
                        "result_type": "count",
                        "data": [{"count": count, "label": "Escalations matching query"}],
                    }

                escalations = q.order_by(Escalation.id.desc()).limit(15).all()
                rows = [
                    {
                        "id": e.id,
                        "title": e.title,
                        "assigned_to": e.assigned_to,
                        "severity": e.severity,
                        "status": e.status,
                        "project_name": e.project_name,
                        "source_text": e.source_text,
                    }
                    for e in escalations
                ]
                sql_trace = "SELECT * FROM escalations WHERE ... LIMIT 15"

            elif any(w in query_lower for w in ["risk", "threat", "severity"]):
                result_type = "risks"
                q = session.query(Risk)

                if any(w in query_lower for w in ["active", "open", "pending"]):
                    q = q.filter(Risk.status == "Active")
                elif any(w in query_lower for w in ["mitigated", "closed", "resolved"]):
                    q = q.filter(Risk.status == "Mitigated")

                projects = [p.name for p in session.query(Project).all()]
                for p in projects:
                    if p.lower() in query_lower:
                        q = q.filter(Risk.project_name == p)

                if any(w in query_lower for w in ["how many", "count"]):
                    count = q.count()
                    return {
                        "success": True,
                        "sql_query": "SELECT COUNT(*) FROM risks WHERE ...",
                        "sql_params": [],
                        "result_type": "count",
                        "data": [{"count": count, "label": "Risks matching query"}],
                    }

                risks = q.order_by(Risk.id.desc()).limit(15).all()
                rows = [
                    {
                        "id": r.id,
                        "title": r.title,
                        "severity": r.severity,
                        "status": r.status,
                        "mitigation_plan": r.mitigation_plan,
                        "project_name": r.project_name,
                        "source_text": r.source_text,
                    }
                    for r in risks
                ]
                sql_trace = "SELECT * FROM risks WHERE ... LIMIT 15"

            elif any(w in query_lower for w in ["decision", "agreed"]):
                result_type = "decisions"
                q = session.query(Decision)

                projects = [p.name for p in session.query(Project).all()]
                for p in projects:
                    if p.lower() in query_lower:
                        q = q.filter(Decision.project_name == p)

                decisions = q.order_by(Decision.id.desc()).limit(15).all()
                rows = [
                    {
                        "id": d.id,
                        "title": d.title,
                        "context": d.context,
                        "project_name": d.project_name,
                        "source_text": d.source_text,
                    }
                    for d in decisions
                ]
                sql_trace = "SELECT * FROM decisions LIMIT 15"

            elif "project" in query_lower:
                result_type = "projects"
                projects = session.query(Project).order_by(Project.risk_score.desc()).all()
                rows = [
                    {"id": p.id, "name": p.name, "risk_score": p.risk_score, "status": p.status}
                    for p in projects
                ]
                sql_trace = "SELECT * FROM projects ORDER BY risk_score DESC"

            elif "meeting" in query_lower:
                result_type = "meetings"
                meetings = session.query(Meeting).order_by(Meeting.date.desc(), Meeting.id.desc()).all()
                rows = [
                    {
                        "id": m.id,
                        "title": m.title,
                        "project_name": m.project_name,
                        "date": m.date,
                        "duration": m.duration,
                        "summary": m.summary,
                    }
                    for m in meetings
                ]
                sql_trace = "SELECT * FROM meetings ORDER BY date DESC"

            else:
                # Fallback: list recent tasks
                result_type = "tasks"
                tasks = session.query(Task).order_by(Task.id.desc()).limit(15).all()
                rows = [
                    {
                        "id": t.id,
                        "title": t.title,
                        "assigned_to": t.assigned_to,
                        "due_date": t.due_date,
                        "status": t.status,
                        "project_name": t.project_name,
                        "source_text": t.source_text,
                    }
                    for t in tasks
                ]
                sql_trace = "SELECT * FROM tasks LIMIT 15"

            return {
                "success": True,
                "sql_query": sql_trace,
                "sql_params": [],
                "result_type": result_type,
                "data": rows,
            }

        except Exception as e:
            logger.error(f"SQLQueryInterpreter error: {e}", exc_info=True)
            return {"success": False, "sql_query": "N/A", "error": str(e), "data": []}
        finally:
            session.close()


# ---------------------------------------------------------------------------
# Query Router
# ---------------------------------------------------------------------------

class QueryRouter:
    def __init__(self):
        self.retriever = Retriever()
        self.response_builder = ResponseBuilder()

    def classify_intent(self, query: str) -> str:
        """
        Three-tier intent classifier with strict priority ordering:

        Priority 1 — REASONING_FOCUSED (Gemini):
            Exclusive reasoning verbs: why, analyze, summarize, compare, recommend...
            "Why is Payment Checkout at risk?" → Reasoning  (even though 'risk' is SQL subject)
            "Summarize recent meetings" → Reasoning

        Priority 2 — SEMANTIC_FOCUSED (ChromaDB vector search):
            Questions about what was discussed/mentioned/talked about in meetings.
            "What did Priya mention in the meeting?" → Semantic

        Priority 3 — SQL_FOCUSED (SQLite):
            Any factual lookup: show/list/count + task/risk/escalation/project/meeting.
            "how many tasks completed by Priya" → SQL
            "show pending tasks for Rahul" → SQL
        """
        query_lower = query.lower().strip()
        words = set(re.findall(r"\b\w+\b", query_lower))

        # Priority 1: REASONING — check FIRST before anything else
        # Reasoning words win even when SQL subject words (risk, task, project) are also present
        has_reasoning = any(phrase in query_lower for phrase in _REASONING_EXCLUSIVE_WORDS)
        if has_reasoning:
            logger.debug(f"[Classifier] REASONING_FOCUSED → exclusive reasoning verb detected")
            return "REASONING_FOCUSED"

        # Priority 2: SEMANTIC — discussing / mentioning something from meetings
        if any(phrase in query_lower for phrase in _SEMANTIC_INTENT_PHRASES):
            logger.debug("[Classifier] SEMANTIC_FOCUSED → semantic phrase detected")
            return "SEMANTIC_FOCUSED"

        # Priority 3: SQL — any database subject word OR SQL verb/phrase present
        has_sql_subject = bool(words & _SQL_SUBJECT_WORDS)
        has_sql_verb = bool(words & _SQL_INTENT_WORDS)
        has_sql_phrase = any(phrase in query_lower for phrase in _SQL_INTENT_PHRASES)
        if has_sql_subject or has_sql_verb or has_sql_phrase:
            logger.debug(f"[Classifier] SQL_FOCUSED → subject={has_sql_subject} verb={has_sql_verb}")
            return "SQL_FOCUSED"

        # Default: semantic search (cheaper than Gemini)
        logger.debug("[Classifier] SEMANTIC_FOCUSED → default fallback")
        return "SEMANTIC_FOCUSED"

    def _pick_collections(self, query_lower: str) -> List[str]:
        """
        Routes query to 1-2 relevant ChromaDB collections only.
        Never queries all collections at once.

        Target distribution:
          - General meeting content → meeting_chunks
          - Risk-related → risks + meeting_chunks
          - Escalation-related → escalations + meeting_chunks
          - Decision-related → decisions
          - Summary request → meeting_summaries
        """
        if any(w in query_lower for w in ["risk", "threat", "danger", "critical"]):
            return ["risks", "meeting_chunks"]
        if any(w in query_lower for w in ["escalation", "blocker", "escalated"]):
            return ["escalations", "meeting_chunks"]
        if any(w in query_lower for w in ["decision", "decided", "agreed", "resolved"]):
            return ["decisions"]
        if any(w in query_lower for w in ["summary", "summarize", "overview"]):
            return ["meeting_summaries"]
        return ["meeting_chunks"]

    def route_and_resolve(self, query: str) -> Dict[str, Any]:
        """
        Routes the user query to SQL_FOCUSED → SEMANTIC_FOCUSED → REASONING_FOCUSED retrieval pathways.
        Then synthesizes a final response using Gemini.
        """
        intent = self.classify_intent(query)
        logger.info(f"[QueryRouter] Intent={intent} | Query='{query}'")

        raw_chunks: List[str] = []
        semantic_results = []
        sql_trace = None

        # ── SQL RETRIEVAL PATHWAY ───────────────────────────────────────────
        if intent == "SQL_FOCUSED":
            result = SQLQueryInterpreter.interpret_and_execute(query)
            if result["success"] and result["data"]:
                sql_context = self.response_builder.format_sql_facts(
                    result["result_type"], result["data"]
                )
                raw_chunks.append(sql_context)
                sql_trace = {"query": result["sql_query"], "params": result["sql_params"]}
                
                # Retrieve auxiliary semantic context as well to make it hybrid-enriched
                query_lower = query.lower()
                collections = self._pick_collections(query_lower)
                for col in collections:
                    hits = self.retriever.retrieve_with_metadata(query, col, limit=2)
                    semantic_results.extend(hits)
                    raw_chunks.extend([h["document"] for h in hits])
            else:
                # If SQL fails or returns empty, fallback retrieval focus to SEMANTIC
                intent = "SEMANTIC_FOCUSED"
                logger.warning("[QueryRouter] SQL execution empty, falling back to SEMANTIC_FOCUSED")

        # ── SEMANTIC RETRIEVAL PATHWAY ──────────────────────────────────────
        if intent == "SEMANTIC_FOCUSED":
            query_lower = query.lower()
            collections = self._pick_collections(query_lower)

            for col in collections:
                hits = self.retriever.retrieve_with_metadata(query, col, limit=3)
                semantic_results.extend(hits)
                raw_chunks.extend([h["document"] for h in hits])

        # ── REASONING RETRIEVAL PATHWAY ─────────────────────────────────────
        if intent == "REASONING_FOCUSED":
            # 1. Fetch relevant SQL context if applicable
            sql_result = SQLQueryInterpreter.interpret_and_execute(query)
            if sql_result["success"] and sql_result["data"]:
                sql_context = self.response_builder.format_sql_facts(
                    sql_result["result_type"], sql_result["data"]
                )
                raw_chunks.append(sql_context)
                sql_trace = {"query": sql_result["sql_query"], "params": sql_result["sql_params"]}

            # 2. Fetch semantic matches
            query_lower = query.lower()
            collections = self._pick_collections(query_lower)
            for col in collections:
                hits = self.retriever.retrieve_with_metadata(query, col, limit=3)
                semantic_results.extend(hits)
                raw_chunks.extend([h["document"] for h in hits])

            # 3. Add summary context
            summary_hits = self.retriever.retrieve_with_metadata(query, "meeting_summaries", limit=1)
            for s in summary_hits:
                raw_chunks.append(f"Summary of {s['metadata'].get('title', 'Meeting')}: {s['document']}")

            # 4. Enrich with active project facts (risks & escalations)
            session = SessionLocal()
            try:
                active_risks = session.query(Risk).filter(Risk.status == "Active").limit(3).all()
                if active_risks:
                    risk_text = "Active Risks:\n" + "\n".join(
                        [f"- {r.title} (Severity: {r.severity}, Project: {r.project_name})" for r in active_risks]
                    )
                    raw_chunks.append(risk_text)

                open_escs = session.query(Escalation).filter(Escalation.status == "Open").limit(3).all()
                if open_escs:
                    esc_text = "Open Escalations:\n" + "\n".join(
                        [f"- {e.title} (Assigned: {e.assigned_to}, Severity: {e.severity}, Project: {e.project_name})" for e in open_escs]
                    )
                    raw_chunks.append(esc_text)
            except Exception as e:
                logger.warning(f"[QueryRouter] SQLite enrichment failed: {e}")
            finally:
                session.close()

        # ── DEDUPLICATE CITATIONS & BUILD CONTEXT ───────────────────────────
        seen_ids = set()
        deduped_semantic = []
        for r in semantic_results:
            if r["id"] not in seen_ids:
                seen_ids.add(r["id"])
                deduped_semantic.append(r)

        # Build context string constrained strictly by the 900-word limit
        compressed_context = build_compressed_context(raw_chunks)

        # Always generate final answer using Gemini
        gemini_response = self.response_builder.build_synthesized_response(
            query, [compressed_context]
        )

        return {
            "intent": intent,
            "query": query,
            "sql_trace": sql_trace,
            "semantic_results": deduped_semantic,
            "response": gemini_response,
        }

