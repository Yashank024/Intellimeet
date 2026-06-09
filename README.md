# IntelliMeet

### AI-Powered Meeting Intelligence & Escalation Tracking System

> **Transforming unstructured organizational conversations into structured, actionable business intelligence.**

---

IntelliMeet is a production-grade, event-driven organizational intelligence system designed to capture, extract, store, and act on meeting conversations. Built with **FastAPI**, **Next.js**, **SQLite**, and **ChromaDB**, IntelliMeet ingests raw transcripts, meeting notes, PDFs, or scanned documents, processes them using a dual **PyMuPDF / PaddleOCR** document processing engine, extracts structured facts using **Gemini AI**, indexes chunks into semantic vector databases, and automatically dispatches async task notifications and deadline reminders via **Resend**. A conversational RAG assistant leverages the hybrid SQLite/ChromaDB retrieval engine to synthesize answers to user queries with full source traceability, ensuring that no action item is lost, no blocker goes unnoticed, and organizational decisions remain permanently accessible.

---

## 📂 Table of Contents
1. [Problem Statement](#-problem-statement)
2. [Our Understanding](#-our-understanding)
3. [Solution Overview](#-solution-overview)
4. [Key Features](#-key-features)
5. [System Overview](#-system-overview)
6. [Complete System Architecture](#-complete-system-architecture)
7. [Document Ingestion Pipeline](#-document-ingestion-pipeline)
8. [RAG Pipeline](#-rag-pipeline)
9. [Database Design](#-database-design)
10. [Vector Database Design](#-vector-database-design)
11. [AI Architecture](#-ai-architecture)
12. [Production-Grade Implementation](#-production-grade-implementation)
13. [API Endpoints](#-api-endpoints)
14. [Email Automation](#-email-automation)
15. [Tech Stack](#-tech-stack)
16. [Project Structure](#-project-structure)
17. [Installation Guide](#-installation-guide)
18. [Environment Variables](#-environment-variables)
19. [Demo Workflow](#-demo-workflow)
20. [Performance & Scalability](#-performance--scalability)
21. [Security Considerations](#-security-considerations)
22. [Future Roadmap](#-future-roadmap)
23. [Team & Author](#-team--author)
24. [Conclusion](#-conclusion)

---

## ⚠️ Problem Statement

In modern fast-paced enterprises, hundreds of virtual and physical meetings occur daily. Important information gets scattered and buried inside hours of meeting recordings, lengthy text transcripts, chaotic meeting notes, and disjointed team summaries. 

The consequences of this "knowledge leakage" are severe:
*   **Lost Accountability**: Critical action items are spoken but never written down, leading to missing ownership.
*   **Hidden Blockers**: Escalations and project risks are raised in discussion but fail to reach engineering leadership.
*   **Missed Deadlines**: Unresolved tasks slip through the cracks, delaying core milestones and product launches.
*   **Leadership Blindspots**: Executives lack real-time visibility into project health, resource bottlenecks, and strategic decisions.

### Business Impact
Organizations waste thousands of engineering hours manually compiling notes, tracking down task statuses, and resolving communication gaps, resulting in project slippage, client churn, and decreased operational velocity.

---

## 💡 Our Understanding

### Why Traditional Solutions Fail
1.  **Manual Meeting Notes**: Relying on team members to manually summarize meetings introduces human bias, takes valuable time, and remains disconnected from operational tracking databases (Jira, SQLite).
2.  **Generic Transcriptions**: Raw speech-to-text outputs are too verbose. A 1-hour transcript can exceed 8,000 words; search is noisy, and critical action items are buried in casual conversational fillers.
3.  **Basic RAG Systems**: Sending the entire raw transcript to LLMs for every query leads to high latency, exorbitant API costs, context window dilution, and hallucinations.

### The Enterprise Challenge
An effective enterprise intelligence system must decouple **Ingestion (Stage 1)** from **Retrieval/Chat (Stage 2)**. During Ingestion, the system must process the complete, raw document (without word limits or truncation) to extract structured database facts. During Retrieval, it must leverage hybrid database routing (relational lookup + semantic search) to compile highly compressed context (max 900 words) so that LLM reasoning remains fast, cheap, and highly factual.

---

## 🛠️ Solution Overview

IntelliMeet bridges the gap between unstructured meeting artifacts and relational operational systems:

```
[Unstructured Input]  ──►  [IntelliMeet Engine]  ──►  [Structured Intelligence]
- Raw Transcripts          - PaddleOCR / PyMuPDF     - Tasks & Assignees
- Scanned Meeting PDF      - Gemini JSON Extraction  - Risks & Mitigation Plans
- PNG Diagrams/Notes       - Sentence Transformers   - Escalations & Blockers
- Copy-pasted text         - Event Dispatcher Bus    - Decisions & Deadlines
```

By mapping every task, risk, escalation, and decision back to its original meeting transcript snippet and chunk ID, IntelliMeet ensures **100% source traceability**, allowing team members to verify the context of any database entry in one click.

---

## ✨ Key Features

### 📦 Ingestion & Core Extraction
*   **1. Meeting Intelligence Extraction**: Automates JSON-mode extraction using Gemini to extract projects, tasks, due dates, severities, decisions, and source snippets.
*   **2. OCR-Powered Document Processing**: Automatically handles digital PDFs (via PyMuPDF) and scanned documents/images (via PaddleOCR fallback).
*   **3. Source Traceability**: Every relational fact (task/risk/escalation) is stored with `source_meeting_id`, `source_chunk_id`, and `source_text` for auditing.

### 📊 Management & Dashboards
*   **4. AI-Powered Risk Detection**: Automatically calculates project risk scores based on pending tasks (2 pts), active risks (3 pts), and open escalations (5 pts).
*   **5. Escalation & Task Tracking**: Interactive Next.js tables display live task status, allowing PMs to update statuses which automatically triggers project risk recalculations.
*   **6. Executive Dashboards**: Real-time KPI cards display total meetings, open tasks, overdue milestones, active risks, and high-risk projects.

### 🔍 Retrieval & Conversational UI
*   **7. Semantic Vector Search**: Embeds transcripts using `all-MiniLM-L6-v2` and indexes them across 5 dedicated ChromaDB collections.
*   **8. Conversational RAG Assistant**: A custom chatbot that utilizes query-time classification (`SQL_FOCUSED`, `SEMANTIC_FOCUSED`, `REASONING_FOCUSED`) to retrieve relevant records, compile a 900-word context, and synthesize final narrative answers.

### ✉️ Event-Driven Orchestration
*   **9. Asynchronous Event Dispatcher**: Employs an in-memory queue and background thread dispatcher to handle notification alerts.
*   **10. Automated Email Alerts**: Integrates with the **Resend API** to trigger emails for meetings processed, tasks assigned, escalations raised, and 24-hour deadline reminders.

---

## 💻 System Overview

The application is split into highly isolated modules following the **Single Responsibility Principle**:

1.  **Frontend (Next.js)**: A premium responsive user interface built using vanilla CSS variables, Outfit/Outfit-sans typography, custom transitions, dashboard cards, task management grids, and a conversational chat console with collapsible database traces.
2.  **Backend (FastAPI)**: REST API gateway serving routes for file uploads, dashboard statistics, meeting listings, risk/escalation updates, and chat responses.
3.  **RAG Layer**: Includes the `Embedder` (SentenceTransformers), `Retriever` (ChromaDB queries with a `0.75` similarity threshold), and `ContextBuilder` (aggregates context and compresses to a max of 900 words).
4.  **Database Layer (SQLAlchemy + SQLite)**: Persistent store for relational tables with strict foreign key constraints (`PRAGMA foreign_keys=ON`).
5.  **Notification Layer (Resend)**: Handles SMTP API calls to Resend.
6.  **AI Layer (Gemini Service)**: Interfaces with the Gemini API for structured JSON extraction and RAG answer synthesis.

---

## 📐 Complete System Architecture

Here is the technical blueprint mapping the components, API routing boundaries, and databases in our Enterprise RAG cluster:

```
+-------------------------------------------------------------+
|                     Next.js WEB FRONTEND                    |
|          (React 19, TS, CSS Variables UI Components)        |
+-------------------------------------------------------------+
                              │
                     [HTTP API JSON REST]
                              │
                              ▼
+-------------------------------------------------------------+
|                       FastAPI BACKEND                       |
|           (Main Gateway, Uvicorn, Router Modules)           |
+-------------------------------------------------------------+
            /                 │                 \
           /                  │                  \
          ▼                   ▼                   ▼
+------------------+ +------------------+ +-------------------+
|  SQLite DATABASE | | Chroma VECTOR DB | |    GEMINI AI      |
| (SQLAlchemy ORM) | | (all-MiniLM-L6)  | |  (Structured/QA)  |
+------------------+ +------------------+ +-------------------+
          ▲                   ▲                   ▲
          │                   │                   │
    [Recalculate]       [Add Chunks]        [Answer / Extract]
          │                   │                   │
+------------------+          │                   │
| EVENT DISPATCHER | ─────────+                   │
|   (Queue/Bus)    |                              │
+------------------+                              │
          │                                       │
    [Daemon Worker]                               │
          ▼                                       │
+------------------+                              │
|    Resend SMTP   | ─────────────────────────────+
|  (Email Alerts)  |
+------------------+
```

---

## 📥 Document Ingestion Pipeline

During Ingestion, documents are processed in their entirety without word limits to ensure that all tasks, risks, and escalations are captured. Below is the ingestion pipeline sequence flow:

```
[User Document Upload] 
         │
         ▼
[Document Processor] ────► (Digital PDF) ────► [PyMuPDF Parser] ────┐
         │                                                           │
         └───────────────► (Scanned / Image) ──► [PaddleOCR Engine] ─┤
                                                                     ▼
                                                             [Raw Text Extracted]
                                                                     │
                                                                     ▼
                                                            [Gemini Extractor]
                                                            (Strict JSON Mode)
                                                                     │
                                                                     ▼
                                                          [Validation (Pydantic)]
                                                                     │
                                      ┌──────────────────────────────┴──────────────────────────────┐
                                      ▼                                                             ▼
                             [SQLite Relational DB]                                       [Chroma Vector Database]
                           - Save Meeting Summary                                       - Segment into Paragraph Chunks
                           - Save Tasks / Due Dates                                     - Generate Embeddings (all-MiniLM)
                           - Save Risks / Escalations                                   - Index Chunks in vector space
                                      │
                                      ▼
                             [Event Dispatch bus] ──► [Async Background Worker] ──► [Resend Email Notification]
```

---

## 🔍 RAG Pipeline

For chat queries, the RAG pipeline optimizes speed and cost by limiting retrieval to relevant content, strictly enforcing a 900-word context window before calling Gemini.

```
                             [User Question]
                                    │
                                    ▼
                          [Intent Classifier]
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
   [SQL_FOCUSED]            [SEMANTIC_FOCUSED]       [REASONING_FOCUSED]
          │                         │                         │
          ▼                         ▼                         ▼
  (SQLite Query)            (Chroma Vector Search)      (Retrieve SQLite Facts
  Retrieve Tasks/Risks      Fetch top_k=3 chunks        + Chroma vector chunks
  and escalations           with similarity >= 0.75     + summaries & projects)
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    │
                                    ▼
                             [Context Builder]
                      (Rank Chunks & Merge context)
                                    │
                                    ▼
                      [Context Cap: Max 900 Words]
                                    │
                                    ▼
                             [Gemini Prompt]
                   (Context + Question + System Inst.)
                                    │
                                    ▼
                            [Gemini Synthesizer]
                                    │
                                    ▼
                        [ narrative Final Answer ]
```

### Context Builder Constraints
*   **Similarity Threshold (`0.75`)**: Chroma distances (L2) are converted to similarity using `similarity = 1.0 / (1.0 + distance)`. Chunks below `0.75` are discarded.
*   **Top_K (`3`)**: Retrieval fetches a maximum of 3 chunks per collection to keep context dense and high-quality.
*   **Context Compression**: Chunks are sorted by informativeness (length proxy) and concatenated until the 900-word limit is reached. Excess text is truncated gracefully.

---

## 🗃️ Database Design

SQLite manages the structured relationship tables with foreign key integrity. Here is the database ERD relationship schema:

```
 +---------------+            +---------------+
 |   employees   |            |   projects    |
 +---------------+            +---------------+
 | id (PK)       |            | id (PK)       |
 | name (UK)     |            | name (UK)     |
 | email (UK)    |            | risk_score    |
 | role, team    |            | status        |
 +---------------+            +---------------+
        │                            │
        │ 1                          │ 1
        │                            │
        │ 0..*                       │ 0..*
 +---------------+            +---------------+            +---------------+
 |     tasks     | 0..*     1 |   meetings    | 1     0..* |   decisions   |
 +---------------+------------+---------------+------------+---------------+
 | id (PK)       |            | id (PK)       |            | id (PK)       |
 | meeting_id(FK)|            | title         |            | meeting_id(FK)|
 | proj_name (FK)|            | proj_name (FK)|            | proj_name (FK)|
 | title         |            | date, duration|            | title         |
 | assigned_to(FK)            | summary       |            | context       |
 | due_date      |            | transcript    |            | source_text   |
 | status        |            +---------------+            +---------------+
 | source_text   |                   │
 +---------------+                   │ 1
                                     │
                                     │ 0..*
                              +---------------+            +---------------+
                              |     risks     |            |  escalations  |
                              +---------------+            +---------------+
                              | id (PK)       |            | id (PK)       |
                              | meeting_id(FK)|            | meeting_id(FK)|
                              | proj_name (FK)|            | proj_name (FK)|
                              | title         |            | title         |
                              | severity      |            | severity      |
                              | status        |            | status        |
                              | mitigation    |            | assigned_to(FK)
                              | source_text   |            | source_text   |
                              +---------------+            +---------------+
```

---

## 🗂️ Vector Database Design

ChromaDB hosts 5 isolated vector collections to keep vector spaces clean and query targets optimized:

| Collection Name | Document Source | Metadata Fields Indexed |
| :--- | :--- | :--- |
| `meeting_chunks` | Segmented meeting transcript paragraphs | `project_name`, `title`, `date`, `meeting_id`, `chunk_id` |
| `meeting_summaries` | Meeting summary paragraphs | `project_name`, `title`, `date`, `meeting_id` |
| `risks` | Extracted risk titles | `project_name`, `meeting_id`, `severity`, `mitigation_plan`, `source_chunk_id` |
| `escalations` | Extracted escalation titles | `project_name`, `meeting_id`, `severity`, `assigned_to`, `source_chunk_id` |
| `decisions` | Extracted decision titles | `project_name`, `meeting_id`, `context`, `source_chunk_id` |

*Note: The system generates embeddings using the `all-MiniLM-L6-v2` model, producing dense 384-dimensional vectors.*

---

## 🧠 AI Architecture

IntelliMeet structures its GenAI operations through dedicated services:

### 1. Ingestion structured extraction
*   **Prompting**: A detailed system instruction prompt (`extraction.txt`) enforces strict JSON-mode response formatting.
*   **JSON Enforcement**: Instructs Gemini to return a raw JSON block containing meeting metadata, tasks, risks, escalations, and decisions.

### 2. Conversational QA reasoning
*   **Retrieval Optimization**: Query classification maps queries to `SQL_FOCUSED` (e.g. metadata counting/status filters), `SEMANTIC_FOCUSED` (conversational history), or `REASONING_FOCUSED` (cross-collection reasoning).
*   **Synthesis**: Compiles the context structure, formats the prompt (`qa.txt`), and calls Gemini to generate a narrative final answer.

### 3. Hallucination Prevention
*   If no matching context chunks meet the `0.75` similarity threshold, the context builder passes an empty context. The prompt template instructs Gemini to state clearly that the answer cannot be found in the context rather than fabricating responses.

---

## 🚀 Production-Grade Implementation

IntelliMeet is built using software patterns designed for stability and extensibility:
*   **Single Responsibility Principle (SRP)**: Document processors, extraction logic, database interactions, event dispatching, and notification gateways are placed in distinct files.
*   **Asynchronous Processing**: Background daemon worker threads prevent database transaction locks during slow external Resend API SMTP dispatches.
*   **Pydantic Input Validation**: Schemas in `schema.py` validate the structures of API requests and responses.
*   **Robust Error Handling**: Connection checks in the health route and database transaction rollbacks (`session.rollback()`) prevent data corruption in SQLite on failure.

---

## 🔌 API Endpoints

The backend exposes the following REST API endpoints under the `/api` prefix:

### Ingestion & Chat
| Method | Endpoint | Purpose | Request Payload | Response Sample |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/upload/` | Ingests transcripts or uploads files (PDF/images) | Form data: `title`, `project`, `text` (optional), `file` (optional) | `{"status": "success", "data": {"meeting_id": 1, "summary": "..."}}` |
| `POST` | `/chat/` | Submits conversational queries to the RAG assistant | `{"query": "Show pending tasks"}` | `{"intent": "SQL_FOCUSED", "confidence": 0.97, "response": "..."}` |

### Dashboard & Metrics
| Method | Endpoint | Purpose | Request Payload | Response Sample |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/` | Returns aggregated statistics for dashboard cards | None | `{"total_meetings": 3, "open_tasks": 7, "active_risks": 2}` |
| `GET` | `/meetings/` | Returns list of all ingested meetings | None | `{"meetings": [{"id": 1, "title": "Sprint Planning", "date": "..."}]}` |
| `GET` | `/meetings/{id}` | Returns meeting detail tables and extracted items | None | `{"meeting": {...}, "tasks": [...], "risks": [...], "escalations": [...]}` |
| `GET` | `/risks/` | Returns active project lists, risk cards, and tasks | None | `{"projects": [...], "risks": [...], "tasks": [...]}` |
| `GET` | `/escalations/` | Returns all project escalation blockers | None | `{"escalations": [{"id": 1, "title": "Vendor API Blocked"}]}` |

### System Updates & Diagnostics
| Method | Endpoint | Purpose | Request Payload | Response Sample |
| :--- | :--- | :--- | :--- | :--- |
| `PUT` | `/risks/tasks/{id}/status` | Updates task status (Pending, Completed, Overdue) | Query parameter: `status` | `{"status": "success", "new_project_risk_score": 12}` |
| `PUT` | `/escalations/{id}/status` | Updates escalation status (Open, Resolved) | Query parameter: `status` | `{"status": "success", "new_project_risk_score": 5}` |
| `GET` | `/system/health` | Diagnostic status check of external/internal resources | None | `{"status": "online", "database": "healthy", "chromadb": "healthy"}` |

---

## ✉️ Email Automation

Notifications run out-of-band to guarantee low API latency. Below is the event-driven notification flow:

```
 [Trigger Events] ────► [TaskAssignedEvent] ──────┐
                  ────► [CriticalEscalationEvent] ├─► [Queue] ─► [Event Dispatcher]
                  ────► [DeadlineReminderEvent] ──┘                    │
                                                                       ▼
                                                           [Background Daemon Worker]
                                                                       │
                                                                       ▼
                                                           [Fetch HTML Template]
                                                                       │
                                                                       ▼
                                                           [Resend API SDK Gateway]
                                                                       │
                                                                       ▼
                                                           [Recipient Inbox Delivery]
```

---

## 🛠️ Tech Stack

### Frontend
*   **Core**: HTML5, Next.js 15 (React 19), TypeScript
*   **Styling**: Vanilla CSS Variables, Lucide React Iconset
*   **State Management**: React Hooks (`useState`, `useEffect`, `useRef`)

### Backend
*   **HTTP Gateway**: FastAPI, Uvicorn, Pydantic
*   **Relational Database**: SQLite, SQLAlchemy ORM
*   **Vector Engine**: ChromaDB
*   **AI Models**: Google Gemini (`gemini-2.5-flash`), SentenceTransformers (`all-MiniLM-L6-v2`)
*   **Document Parsers**: PyMuPDF (`fitz`), PaddleOCR
*   **Email Deliverability**: Resend Client SDK

---

## 📁 Project Structure

```
Intellimeet/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI Application bootstrap
│   │   ├── routes/                 # Endpoint routing controllers
│   │   │   ├── upload.py
│   │   │   ├── chat.py
│   │   │   ├── dashboard.py
│   │   │   ├── meetings.py
│   │   │   ├── risks.py
│   │   │   ├── escalations.py
│   │   │   └── health.py
│   │   ├── database/               # Relational configurations
│   │   │   ├── db.py
│   │   │   ├── models.py
│   │   │   ├── seed.py
│   │   │   └── schema.py
│   │   ├── services/               # OCR & Document extraction logic
│   │   │   ├── document_processor.py
│   │   │   ├── pymupdf_service.py
│   │   │   ├── paddleocr_service.py
│   │   │   ├── gemini_service.py
│   │   │   ├── query_router.py
│   │   │   └── deadline_scheduler.py
│   │   ├── rag/                    # Vector retrieval & context building
│   │   │   ├── chroma_service.py
│   │   │   ├── embedder.py
│   │   │   ├── retriever.py
│   │   │   ├── chunker.py
│   │   │   └── response_builder.py
│   │   ├── notifications/          # Email formatting templates
│   │   │   ├── notification_service.py
│   │   │   ├── resend_service.py
│   │   │   └── templates.py
│   │   ├── events/                 # Pub-Sub Event Mediators
│   │   │   ├── dispatcher.py
│   │   │   └── events.py
│   │   └── prompts/                # LLM System Text Prompts
│   │       ├── extraction.txt
│   │       └── qa.txt
│   ├── requirements.txt            # Python dependencies list
│   └── tests/                      # Integration verification scripts
│       └── test_integration.py
└── frontend/                       # Next.js web application
```

---

## ⚙️ Installation Guide

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)

### 1. Clone & Set Up Directory
```bash
git clone https://github.com/your-username/IntelliMeet.git
cd IntelliMeet
```

### 2. Backend Installation
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend Installation
```bash
cd ../frontend
npm install
```

### 4. Database Setup & Seed
From the `backend/` directory:
```bash
$env:PYTHONPATH = "app"
python app/database/seed.py
```

### 5. Running the Servers

#### Start Backend (Port 8000)
From the `backend/` directory:
```bash
$env:PYTHONPATH = "app"
uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload
```

#### Start Frontend (Port 3000)
From the `frontend/` directory:
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the dashboard.

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory:

| Variable | Required | Purpose / Value |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | Google AI Studio Gemini API Key |
| `RESEND_API_KEY` | No | Resend API key (if unprovided, defaults to log simulation) |
| `GEMINI_MODEL` | No | Models to use. Defaults to `gemini-2.5-flash` |
| `DATABASE_URL` | No | SQLAlchemy connection path. Defaults to `sqlite:///meeting_data.db` |
| `CHROMA_DB_PATH` | No | Directory path to store vector cache. Defaults to `chroma_db` |

---

## 🔄 Demo Workflow

1.  **Ingestion**: Navigate to the upload page and upload `vendor_sync.pdf` or paste a transcript text.
2.  **Processing**: The document processor extracts text, sends it to Gemini, validates the JSON output, inserts records (tasks, risks, escalations) into SQLite, and indexes embeddings in ChromaDB.
3.  **Notifications**: Background threads trigger email alerts to Yashank Gupta regarding task assignments.
4.  **Recalculation**: The project risk score updates in the dashboard (e.g. status changes to `Medium Risk` due to active tasks).
5.  **Interactive Q&A**: Ask the chat assistant: *"What is the mitigation plan for the Vendor API timeout blocker?"*.
6.  **RAG Execution**: The assistant classifies the intent, queries database tables, fetches the risk description from vector space, builds a 900-word context, and invokes Gemini to generate the final synthesized response with citations.

---

## 📈 Performance & Scalability

### Hackathon Sizing (Current State)
*   **Meetings**: 100-500
*   **Database**: In-process SQLite + local ChromaDB persistent file storage.
*   **Embeddings**: Processed on CPU (latency ~100ms per paragraph batch).

### Enterprise Scaling Strategy
To support 10,000+ to 1 million meetings:

```
[FastAPI Gateways] ──► [Celery Task Workers] ──► [Distributed DB Cluster]
- Autoscale Nodes      - Async OCR Processing   - PostgreSQL DB
                       - Batch embedding (GPUs) - Managed Vector DB (Qdrant / PGVector)
```

---

## 🔒 Security Considerations

*   **API Validation**: Pydantic interfaces intercept payloads to block bad parameters.
*   **SQL Parameterization**: SQLAlchemy protects against SQL Injection.
*   **API isolation**: Database schemas are hidden from client routes; only serialized JSON schemas are returned.
*   **Secrets Protection**: API credentials are loaded dynamically from environment configurations.

---

## 🗺️ Future Roadmap

*   **Multi-Agent Workflows**: Integrate agents that coordinate to resolve blockers and cross-reference tasks.
*   **Neo4j Integration**: Connect entities to map dependencies between developers and milestones.
*   **Communication Plugins**: Build native integrations for Slack, Teams, and Google Meet.
*   **Automated Voice Transcription**: Incorporate Whisper API models for automated audio recording imports.

---

## 👥 Team & Author

*   **Author**: Yashank Gupta
*   **Role**: AI Engineer
*   **Organization**: IntimeTec
*   **Github**: [https://github.com/yashank-dev](https://github.com/yashank-dev)

---

## 🏁 Conclusion

IntelliMeet changes how organizations manage knowledge by converting verbose, unorganized meeting transcripts into structured database facts and semantic vector indexes. By combining SQLite's relational reliability, ChromaDB's semantic capabilities, and Gemini's synthesis power, IntelliMeet ensures that accountability is maintained, deadlines are tracked, and crucial organizational knowledge remains searchable and auditable in real-time.
