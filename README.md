# IntelliMeet: Intelligent Meeting Intelligence & Escalation Tracking System

An AI-powered organizational intelligence system built for the GenAI Hackathon. IntelliMeet ingests unstructured meeting discussions (raw transcripts, text notes, PDFs, or scanned images), automatically extracts structured data using Gemini AI and PaddleOCR, stores it in SQLite and ChromaDB, calculates project risk scores, and automates task-assignment notifications via email.

---

## 🚀 Project Overview

Modern organizations lose critical knowledge in the daily flood of meetings. Key action items, project blockers, and team dependencies get buried in long recordings or chat threads. **IntelliMeet** solves this by converting unstructured meeting content into structured, actionable business intelligence.

### Core Capabilities
1. **Multimodal Ingestion**: Ingest raw transcripts, text summaries, or documents (PDFs, images) using **PaddleOCR** for text extraction.
2. **Structured AI Extraction**: Process text with **Gemini AI** to extract projects, tasks, owners, deadlines, blockers, risks, escalations, decisions, and teams.
3. **Hybrid Database Architecture**: 
   - **SQLite**: Structured business data (employees, tasks, escalations, risk scores) for exact, high-performance relational queries.
   - **ChromaDB**: Semantic vector store for full transcripts and summary chunks to power deep, natural language RAG (Retrieval-Augmented Generation) queries.
4. **Measurable Intelligence (Risk Scoring Engine)**: Live project health metrics calculated automatically:
   $$\text{Risk Score} = (\text{Open Escalations} \times 5) + (\text{Open Risks} \times 3) + (\text{Overdue Tasks} \times 2)$$
5. **AI $\rightarrow$ Action $\rightarrow$ Accountability**: Automated email notification system utilizing SMTP to alert owners of new task assignments immediately.
6. **Conversational Querying (RAG)**: Ask natural language questions like *"Which projects are at risk this week?"* or *"Who is working on the Backend API?"* with accurate, context-aware answers.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js (App Router), Tailwind CSS, Shadcn/ui | Premium, modern UI; fast and interactive dashboard components. |
| **Backend** | FastAPI (Python) | High performance, automatic OpenAPI docs, seamless integration with Python AI tools. |
| **Extraction AI** | Gemini API | Native JSON mode capability, long context window, high accuracy. |
| **OCR Engine** | PaddleOCR | Robust document and image-based text extraction. |
| **Structured Store** | SQLite | Zero-config, single-file database, ideal for same-day hackathon speed and reliability. |
| **Vector Database** | ChromaDB | Lightweight local vector database for semantic search and RAG. |
| **Alert Engine** | SMTP | Simple, universally supported protocol for automated accountability emails. |

---

## 🗄️ Database Architecture

To ensure speed and accurate data querying, IntelliMeet splits data storage between relational (SQLite) and semantic (ChromaDB) databases.

```
                  ┌──────────────────────────────┐
                  │   Meeting Ingestion Pipeline │
                  └──────────────┬───────────────┘
                                 │
                     [ PaddleOCR / Raw Text ]
                                 │
                                 ▼
                         [ Gemini AI ]
                                 │
                                 ▼
                     ┌───────────┴───────────┐
                     │  Structured Extractor │
                     └─────┬───────────┬─────┘
                           │           │
             [SQLite]      │           │      [ChromaDB]
             (Relational)  ▼           ▼      (Semantic Vector)
             ┌─────────────────┐   ┌───────────────────────────┐
             │ - Employees     │   │ - Transcript Chunks       │
             │ - Projects      │   │ - Meeting Summaries       │
             │ - Tasks         │   │ - Risks & Escalations     │
             │ - Escalations   │   │ - Key Decisions           │
             │ - Risks         │   └───────────────────────────┘
             │ - Decisions     │
             └─────────────────┘
```

### 1. SQLite Relational Schema
SQLite stores structured, relational business entities. Below are the table schemas used:

#### `employees`
Stores organization members. Used for resolving task owners and mapping email notifications.
```sql
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    team TEXT NOT NULL,
    role TEXT NOT NULL
);
```

#### `meetings`
Stores basic details and transcripts of ingested meetings.
```sql
CREATE TABLE meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    transcript TEXT NOT NULL,
    summary TEXT NOT NULL
);
```

#### `projects`
Stores high-level initiatives. `risk_score` is updated dynamically by the scoring engine.
```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'Active', -- Active, Completed, On Hold
    priority TEXT NOT NULL DEFAULT 'Medium', -- Low, Medium, High
    risk_score INTEGER DEFAULT 0
);
```

#### `tasks`
Trackable action items extracted from meetings.
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    owner_id INTEGER,
    task TEXT NOT NULL,
    deadline TEXT, -- Raw text or parsed ISO format
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Completed, Overdue
    priority TEXT NOT NULL DEFAULT 'Medium', -- Low, Medium, High
    FOREIGN KEY(project_id) REFERENCES projects(id),
    FOREIGN KEY(owner_id) REFERENCES employees(id)
);
```

#### `escalations`
Critical blockers raised by team members that require immediate leadership attention.
```sql
CREATE TABLE escalations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    raised_by INTEGER,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Medium', -- Medium, High, Critical
    status TEXT NOT NULL DEFAULT 'Open', -- Open, Resolved
    FOREIGN KEY(project_id) REFERENCES projects(id),
    FOREIGN KEY(raised_by) REFERENCES employees(id)
);
```

#### `risks`
Identified operational or timeline risks that might impact deliverables.
```sql
CREATE TABLE risks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Medium', -- Low, Medium, High
    status TEXT NOT NULL DEFAULT 'Active', -- Active, Mitigated
    FOREIGN KEY(project_id) REFERENCES projects(id)
);
```

#### `decisions`
Key agreements and architecture resolutions made in the meeting.
```sql
CREATE TABLE decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    decision TEXT NOT NULL,
    reason TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id)
);
```

### 2. ChromaDB Collections
ChromaDB stores raw, searchable texts as vector embeddings to support semantic queries:

*   **`meeting_transcripts`**: Stores meeting transcripts broken down into smaller chunks (500–1000 characters) with metadata (`meeting_id`, `title`, `date`).
*   **`meeting_summaries`**: Stores raw summaries mapped to `meeting_id` and `project_id`.
*   **`risks_vectors`**: Stores text descriptions of risks to check for duplicate risks or similar blocker mentions.
*   **`escalations_vectors`**: Stores escalation texts to match future discussions with existing open issues.

---

## 📊 Frontend Architecture & Dashboards

The frontend uses Next.js with a premium, responsive layout. It is structured into **5 main pages** for the hackathon demo:

### 1. `/` - Executive Dashboard
A dashboard designed for leadership and project managers. Includes:
*   **6 Key Metrics Cards**:
    *   *Total Meetings* (Count of records in `meetings`)
    *   *Open Tasks* (Count of pending tasks)
    *   *Open Escalations* (Count of open escalations)
    *   *Projects At Risk* (Count of projects with Risk Score > 10)
    *   *Overdue Tasks* (Count of past-deadline pending tasks)
    *   *High Severity Risks* (Count of Active risks marked High or Critical)
*   **Unresolved Escalations Table**: Lists current escalations, severity levels, raised-by details, and projects.
*   **Project Health Chart**: A responsive bar chart displaying the calculated Risk Score of each project.

### 2. `/upload` - Ingestion Pipeline
An interactive portal that handles ingestion:
*   **Form Inputs**: Meeting Title, Date, and Source Selection (Raw Transcript Text, Scanned Document Text, or PDF/Image file upload).
*   **OCR Processing State**: Visual progress indicator showing PaddleOCR extracting text.
*   **Gemini Extraction Preview**: Live JSON syntax highlighter showing the exact extracted object before confirmation.
*   **Save Action**: Saves to SQLite, embeds into ChromaDB, and triggers notifications.

### 3. `/meetings` - Meeting History
A timeline view of the organization's discussions:
*   Lists all meetings processed.
*   Detail views for each meeting showing its full transcript, AI-generated summary, and tabs for extracted tasks, risks, and decisions.

### 4. `/chat` - Ask Questions (RAG Center)
A natural language conversational interface:
*   **Hybrid Route Dispatcher**:
    *   If a user asks structured query types (*"Show unresolved escalations"* or *"Show all tasks assigned to Rahul"*), the system bypasses the LLM and runs a direct SQLite SQL query.
    *   If a user asks context/historical queries (*"Which meetings discussed Vendor API issues?"*), the backend performs a similarity search in ChromaDB to retrieve matching transcript sections and synthesizes the answer using Gemini.

### 5. `/escalations` - Risk & Escalation Center
A dedicated board focusing purely on bottlenecks:
*   **Risk Heatmap**: Visualization of issues categorized by Project, Severity, and Status.
*   **Interactive Status Toggles**: Quickly mark tasks as Completed or escalations as Resolved, which updates the Project Risk Score in real time.

---

## 🔄 Data & Notification Flow

```
                      ┌──────────────────────┐
                      │ Meeting Content Upload│
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │      PaddleOCR       │
                      │ (Extracts Raw Text)  │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │    Gemini API        │
                      │  (JSON Extraction)   │
                      └──────────┬───────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │ SQLite & Chroma Insert │
                     └──────────┬─────────────┘
                                │
                    ┌───────────┴───────────┐
                    │  Did we find new tasks│
                    │   assigned to owners? │
                    └───────────┬───────────┘
                                │ Yes
                                ▼
                     ┌──────────────────────┐
                     │ Look up Owner Email  │
                     │  in sqlite database  │
                     └──────────┬───────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │   Trigger SMTP Server │
                     │ Send Notification Email│
                     └──────────────────────┘
```

### AI Extraction Schema (Gemini System Prompt Format)
We prompt Gemini to return a strict, parsable JSON structure:
```json
{
  "project": "Payment Integration",
  "teams": ["Backend Team", "Vendor QA"],
  "tasks": [
    {
      "owner": "Rahul",
      "task": "Coordinate with backend team",
      "deadline": "Friday",
      "priority": "High"
    }
  ],
  "blockers": [
    {
      "description": "Vendor API instability"
    }
  ],
  "risks": [
    {
      "description": "Phase 2 release delay",
      "severity": "High"
    }
  ],
  "escalations": [
    {
      "raised_by": "Priya",
      "description": "Escalated payment integration delays to leadership",
      "severity": "Critical"
    }
  ],
  "decisions": [
    {
      "decision": "Defer non-critical Phase 2 features",
      "reason": "Unstable vendor API is blocking progress"
    }
  ]
}
```

### Automated Task Assignment Email Template
```
Subject: [IntelliMeet] New Task Assigned: Coordinate with backend team

Hi Rahul,

A new action item has been automatically extracted and assigned to you from today's meeting.

📋 Task: Coordinate with backend team
📅 Deadline: Friday
🔥 Priority: High
📂 Project: Payment Integration

Please review this task and update its progress in the dashboard when completed.

Best regards,
IntelliMeet Notification Bot
```

---

## 📅 Hackathon Implementation Plan & Timeline

| Time Slot | Module | Target Deliverable | Status |
|---|---|---|---|
| **10:00 AM - 10:45 AM** | **Scaffolding & DB** | Scaffold FastAPI + Next.js projects; Initialize SQLite tables; Initialize ChromaDB. | 📝 Todo |
| **10:45 AM - 12:00 PM** | **Extraction Pipeline** | Implement upload endpoints; Integrate PaddleOCR; Integrate Gemini JSON extraction; Write DB insertion logic. | 📝 Todo |
| **12:00 PM - 01:00 PM** | **Dashboard & Tables** | Build Dashboard UI; Create Risk scoring calculator; Display charts and tables. | 📝 Todo |
| **01:00 PM - 02:00 PM** | **Chat & RAG Engine** | Build `/chat` component; Implement SQLite structured query router; Integrate Chroma vector retrieval. | 📝 Todo |
| **02:00 PM - 02:45 PM** | **Email Notifications** | Implement SMTP helper; Hook task inserts to email notifier; Calculate live project health scores. | 📝 Todo |
| **02:45 PM - 03:15 PM** | **Polish & Seed Data** | Load employee profiles; Seed demo scripts; Test complete upload $\rightarrow$ extract $\rightarrow$ alert loop. | 📝 Todo |
| **03:15 PM - 03:30 PM** | **Demo Prep** | Record video demo; Clean logs; Prepare pitch presentation. | 📝 Todo |

---

## 🏃‍♂️ How to Run Locally

### Prerequisites
*   Python 3.10+
*   Node.js v18+
*   C++ Build Tools (Required for ChromaDB / SQLite extensions if building from source, or install binary wheels)

### Setup Backend (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlite3 chromadb google-generativeai paddleocr paddlepaddle-tiny pydantic
   ```
4. Set environment variables (create a `.env` file):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Setup Frontend (Next.js)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create `.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Demo Script / Validation Scenarios

To prove the core value to the hackathon judges:

1. **Seed Employee Table**: Load Rahul (Backend Team) and Priya (Product Team).
2. **First Ingestion & Parse**:
   *   *Input*: *"The payment integration is delayed because the Vendor API is unstable. Rahul will coordinate with the backend team before Friday. If this issue continues, it may impact the Phase-2 release. Priya escalated the concern to leadership."*
   *   *System Action*: Extract project "Payment Integration", owner Rahul, risk "Phase-2 delay", escalation "Priya", blocker "Vendor API instability".
   *   *Email Result*: Rahul receives an automated email detailing the backend coordination task.
3. **Structured Query Verification**:
   *   *Ask*: *"Show unresolved escalations"* $\rightarrow$ System queries SQLite and returns Priya's escalation instantly.
4. **Semantic Query Verification**:
   *   *Ask*: *"Which meetings discussed Vendor API issues?"* $\rightarrow$ System scans ChromaDB and returns the newly uploaded meeting.
5. **Score Verification**:
   *   "Payment Integration" displays on the dashboard with a Risk Score of **19** (1 Open Escalation $\times$ 5 + 1 Open Risk $\times$ 3 + 1 Overdue/Pending Task $\times$ 2 - wait, if the task is pending, it qualifies for Open Escalation/Risk/Task calculations).

---

## 🎨 Frontend Implementation Details & UX Refinements

The frontend portion of **IntelliMeet** has been built using a premium, professional corporate design system. It leverages a clean cream-and-teal brand palette, advanced typographic pairing, and highly interactive user experience (UX) elements to make it boardroom-ready.

### 1. Typography & Theme System
*   **Font Pairing**: Configured Google fonts via Next.js Font loaders:
    *   `Outfit`: Used for clean, geometric body copy, lists, metrics, metadata, and buttons.
    *   `DM Serif Display`: Used for elegant, editorial page headers, primary welcomes, and sidebar branding.
*   **Tailwind v4 theme mappings**: Explicitly bound `--font-sans` and `--font-serif` to the next/font CSS variables inside [globals.css](file:///c:/Users/Lenovo/Desktop/Intellimeet/frontend/app/globals.css) to prevent system font fallback.
*   **Palette Enforcement**:
    *   `Warm Cream Background` (`#F6F1E9`): Warm cream base canvas.
    *   `Forest Teal Green` (`#0D6A5D` / `var(--primary)`): Primary brand color for highlights, active links, and buttons.
    *   `Warm Coral Orange` (`#E06B36` / `var(--accent)`): Accent color for alerts, trend lines, and action overlays.
    *   `Deep Green-Slate` (`#091E1A`): Dark contrast color for the sidebar container.

### 2. Dashboard Polish (`/`)
*   **Refined Header Sizing**: Titles render in large, tracking-wide serif headers.
*   **High-Contrast Stats Cards**: Metric counts are bold, high-contrast values. Cards animate smoothly on hover (`hover:-translate-y-0.5 hover:shadow-md hover:border-primary/25`).
*   **Consistent Chart Branding**: Re-styled all custom SVG indicators (weekly lines, project bars, risk allocation donut chart) to render in matching forest green and warm orange accents.

### 3. AI Chat Assistant Overhaul (`/chat`)
*   **Active Chat Capsule Input Bar**: Overhauled the bottom text box into a capsule/pill shaped bar (`rounded-full bg-card-bg`). Includes attachment plus triggers, model selection, microphone actions, and a signature circular button.
*   **Dynamic Circular Icon States**: The signature button shows a white soundwave/waveform SVG over a forest green background when the text box is empty, and automatically shifts into a warm orange Send button when text is typed.
*   **Auto-Growing Text Input**: Textarea dynamically expands in height as long queries are entered (up to `90px` limit) without breaking page bounds.
*   **Collapsible Dev Trace Accordions**: Integrated database SQLite queries and vector retrieval citations into a native details dropdown (*"View Engine Trace & citations"*), maintaining an executive-clean conversation bubble.
*   **Animated Typing Indicator**: Bouncing dot animation bubbles render when the chat state is fetching a response.
*   **Voice Stream Ingestion Simulator**: Clicking the microphone displays an overlay displaying sound wave rings with buttons to simulate or cancel speech inputs.

### 4. Sidebar Redesign
*   **Custom SVG Branding**: Replaced the static PNG logo with an inline SVG representing soundwave data and AI sparkles, colored with the accent theme gradient.
*   **Dark Green-Slate Contrast**: Changed sidebar background to `#091E1A` with a dark divider structure to visually frame the main cream canvas.

---

## 📂 Complete Frontend Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx             # Fonts loading, HTML structure, global Sidebar/Navbar wrapping
│   ├── globals.css            # Custom CSS variables, theme classes, scrollbars, and keyframe animations
│   ├── page.tsx               # Executive Dashboard (Stats grid, Project Health, Risk Distribution, Escalation Trend)
│   ├── chat/
│   │   └── page.tsx           # AI Chat Assistant (Landing prompts, active capsule inputs, voice overlay)
│   ├── upload/
│   │   └── page.tsx           # Meeting Upload (Simulated OCR processing steps and JSON extract preview)
│   ├── meetings/
│   │   └── page.tsx           # Meetings History (Expanadable transcripts, tabs for tasks, risks, and decisions)
│   ├── escalations/
│   │   └── page.tsx           # Escalation Center (Kanban/table views with quick-resolve toggles)
│   └── risks/
│       └── page.tsx           # Risk Analytics (Heatmap, project severity listings, dynamic risk calculations)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # High-contrast sidebar navigation, inline SVG logo, active links
│   │   ├── Navbar.tsx         # Top dashboard system indicators and profile tags
│   │   └── PageHeader.tsx     # Typography unified serif header component
│   ├── dashboard/
│   │   ├── StatsCard.tsx             # Interactive metric cards with hover translate effects
│   │   ├── ProjectHealthChart.tsx    # Responsive dynamic horizontal project health score bar
│   │   ├── EscalationTrendChart.tsx  # Interactive weekly SVG line/area trend graph
│   │   ├── RiskDistributionChart.tsx # Dynamic risk donut visualizer with legend offsets
│   │   └── RecentMeetings.tsx        # Table listing recently processed sync sessions and tasks
│   └── common/
│       ├── Loader.tsx         # Pulsing logo spinner
│       ├── EmptyState.tsx     # Large themed visual panel shown when lists are clean/empty
│       └── ErrorState.tsx     # Warning states
├── hooks/
│   ├── useChat.ts             # Manages conversation history, loading indicators, and message dispatches
│   ├── useMeetings.ts         # Handles seed and uploaded meeting objects
│   ├── useEscalations.ts      # Tracks blockers and resolution status updates
│   └── useRisks.ts            # Calculates project risk ratings dynamically
├── services/
│   ├── chatService.ts         # Simulated Gemini / RAG trace responses
│   ├── meetingService.ts      # localstorage API hooks for parsed transcription cards
│   ├── riskService.ts         # Tracks active projects
│   └── escalationService.ts   # Updates escalation items
├── types/
│   ├── chat.ts                # Typings for messages, citations, and model strings
│   ├── meeting.ts             # Card metadata types
│   ├── risk.ts                # Severity metrics and projects structures
│   └── escalation.ts          # Severity, owner, and blocker statuses
├── lib/
│   └── mockData.ts            # LocalStorage seed initializers (empty meetings, tasks, risks; employees roster)
├── package.json               # Configured next, react, lucide-react dependencies
└── tsconfig.json              # TypeScript compilation rules
```
