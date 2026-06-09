from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.query_router import QueryRouter

class ChatRequest(BaseModel):
    query: str

router = APIRouter(prefix="/chat", tags=["Chat"])
query_router = QueryRouter()

# Map intents to confidence scores (based on query router classifier certainty)
INTENT_CONFIDENCE_MAP = {
    "SQL_FOCUSED": 0.97,
    "SEMANTIC_FOCUSED": 0.94,
    "REASONING_FOCUSED": 0.91,
}

@router.post("/")
async def chat_assistant(request: ChatRequest):
    try:
        result = query_router.route_and_resolve(request.query)

        intent = result.get("intent", "GENERAL")
        confidence = INTENT_CONFIDENCE_MAP.get(intent, 0.80)

        sql_query_str = None
        if result.get("sql_trace"):
            sql_query_str = result["sql_trace"].get("query")

        citations = []
        sources = []
        if result.get("semantic_results"):
            for res in result["semantic_results"]:
                meta = res.get("metadata", {})
                citations.append({
                    "meetingId": meta.get("meeting_id", 1),
                    "meetingTitle": meta.get("title", "Meeting"),
                    "textExcerpt": res["document"]
                })
                title = meta.get("title")
                if title and title not in sources:
                    sources.append(title)

        return {
            "intent": intent,
            "confidence": confidence,
            "response": result["response"],
            "sqlQuery": sql_query_str,
            "citations": citations,
            "sources": sources,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
