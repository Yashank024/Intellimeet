import os
import sys
import shutil

# Adjust python path to load app services
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_root)
sys.path.append(os.path.join(backend_root, "app"))

from app.database.db import Database
from app.database.seed import seed_db
from app.services.extraction_service import ExtractionService
from app.services.query_router import QueryRouter

def run_integration_test():
    print("=== STARTING INTEGRATION TEST ===")
    
    # 1. Reset database for clean test
    try:
        if os.path.exists("meeting_data.db"):
            os.remove("meeting_data.db")
        if os.path.exists("chroma_db"):
            shutil.rmtree("chroma_db")
        print("Database and Chroma cache reset successfully.")
    except PermissionError:
        print("[Warning] Database or ChromaDB is locked by another process (e.g. uvicorn). Skipping reset and running test on active DB.")
    
    # 2. Setup database and seed
    Database.initialize_schema()
    seed_db()
    print("Relational database schemas initialized & employees seeded.")
    
    # 3. Sample transcript to ingest
    transcript_title = "Checkout Stability and Payment Integration Alignment Sync"
    transcript_text = """
The payment checkout blocker sync was held on June 9th, 2026.

Priya Verma: We are experiencing some severe checkout stability issues. The checkout success rate dropped by 15% yesterday because the Vendor API is extremely unstable and giving frequent timeouts. This is a significant risk to our Phase-2 launch next month.

Rahul Sharma: I will coordinate with the backend team before Friday to implement fallback route mechanisms and add redundant webhook validation to handle timeouts gracefully.

Yashank Gupta: I will work on the AI automated anomaly detection alerts using Gemini to notify developers when checkout failures spike. I will complete this tasks by Monday.

Priya Verma: Great, thank you. I am officially escalating this Vendor API timeout blocker to engineering leadership to request additional support from their infrastructure team.
"""

    # 4. Ingest via Extraction Pipeline
    print("\nProcessing transcript through ExtractionService...")
    extraction_service = ExtractionService()
    result = extraction_service.process_transcript(transcript_title, transcript_text)
    
    print("\nIngestion Result Summary:")
    print(f"- Project: {result['project_name']}")
    print(f"- Risk Score: {result['risk_score']}")
    print(f"- Status: {result['status']}")
    print(f"- Summary: {result['summary']}")
    
    # 5. Query Router Resolution
    router = QueryRouter()
    
    # Test Query 1: SQL Relational Fact Lookup
    print("\n--- Test Query 1 (SQL Intent) ---")
    query_1 = "Show pending tasks for Rahul"
    res_1 = router.route_and_resolve(query_1)
    print(f"Classified Intent: {res_1['intent']}")
    print(f"SQL Trace Query: {res_1['sql_trace']['query'] if res_1['sql_trace'] else 'N/A'}")
    print(f"SQL Trace Params: {res_1['sql_trace']['params'] if res_1['sql_trace'] else 'N/A'}")
    print("Response Content:")
    print(res_1['response'])
    
    # Test Query 2: Semantic Vector Match
    print("\n--- Test Query 2 (Semantic Vector Intent) ---")
    query_2 = "What discussions happened about Vendor API instability?"
    res_2 = router.route_and_resolve(query_2)
    print(f"Classified Intent: {res_2['intent']}")
    print("Response Content:")
    print(res_2['response'])
    
    # Test Query 3: Gemini Synthesis Reasoning
    print("\n--- Test Query 3 (Reasoning Intent) ---")
    query_3 = "Why is the Payment Integration project at risk?"
    res_3 = router.route_and_resolve(query_3)
    print(f"Classified Intent: {res_3['intent']}")
    print("Response Content:")
    print(res_3['response'])
    
    print("\n=== INTEGRATION TEST COMPLETE ===")

if __name__ == "__main__":
    run_integration_test()
