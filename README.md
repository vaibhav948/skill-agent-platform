# Skill Agent Platform

A dynamic user-defined skills agent platform where users can create reusable AI skills with tools, approvals, and execution tracking.

---

## 🚀 Live Demo

[Add your deployed URL here once deployed]

---

## ✨ Features

- ✅ Create skills with name, purpose, instructions, and JSON schemas
- ✅ Define allowed tools (calculator, document search, record lookup, mock task)
- ✅ Mark tools requiring human approval
- ✅ Test skills with custom input
- ✅ Step-by-step execution with real-time logging
- ✅ Approval workflow for write actions
- ✅ Execution history with detailed logs
- ✅ Version tracking for skills
- ✅ Compare versions and rerun previous skill versions
- ✅ Draft and published skill versions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python FastAPI, SQLAlchemy, SQLite |
| **Frontend** | React, Tailwind CSS, Monaco Editor |
| **AI/LLM** | Google Gemini API (free tier) |
| **Database** | SQLite (development) |

---

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- Google Gemini API Key (free from [AI Studio](https://aistudio.google.com/apikey))

---

## 🔧 Setup Instructions

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Edit .env and add your GEMINI_API_KEY
# GEMINI_API_KEY=your_key_here

# Run the backend server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run the frontend server
npm start
```

### Docker Setup (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
# Required: Get from https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///./skill_platform.db

# Application Settings
DEBUG=True
```

### Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 🏗️ Architecture

### Backend Structure

```
backend/app/
├── api/                    # REST API endpoints
│   ├── skills.py          # Skill CRUD operations
│   ├── executions.py      # Execution management
│   └── tools.py           # Tool listing
├── models/                 # SQLAlchemy models
│   ├── skill.py           # Skill model with version tracking
│   ├── execution.py       # Execution model with logs
│   └── skill_version.py   # Version history table
├── tools/                  # Tool implementations
│   ├── calculator.py      # Math operations
│   ├── document_search.py # Search knowledge base
│   ├── record_lookup.py   # Record retrieval
│   └── mock_task.py       # Task management with approval
├── agents/                 # AI/LLM integration
│   └── planner.py         # Gemini planning agent
├── execution/              # Execution engine
│   └── engine.py          # Step-by-step execution
├── schemas/                # Pydantic schemas
└── db/                     # Database setup
```

### Frontend Structure

```
frontend/src/
├── pages/                  # Main views
│   ├── Dashboard.jsx      # Statistics overview
│   ├── Skills.jsx         # Skill management
│   ├── SkillBuilder.jsx   # Create/Edit skills
│   ├── TestSkill.jsx      # Execute and test skills
│   ├── History.jsx        # Execution history
│   └── CompareVersions.jsx # Version comparison
├── components/             # Reusable components
├── services/               # API clients
└── hooks/                  # Custom React hooks
```

---

## 📡 API Endpoints

### Skills

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | List all skills |
| POST | `/api/skills` | Create a skill |
| GET | `/api/skills/{id}` | Get skill details |
| PUT | `/api/skills/{id}` | Update skill |
| DELETE | `/api/skills/{id}` | Delete skill |
| GET | `/api/skills/{id}/versions` | Get version history |

### Executions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/executions` | Start execution |
| GET | `/api/executions` | List executions |
| GET | `/api/executions/{id}` | Get execution details |
| POST | `/api/executions/{id}/approve` | Approve/reject step |
| POST | `/api/executions/{id}/cancel` | Cancel execution |

### Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tools` | List all available tools |

---

## 🛠️ Available Tools

| Tool | Description | Requires Approval |
|------|-------------|-------------------|
| **Calculator** | Perform mathematical calculations | ❌ No |
| **Document Search** | Search through QA standards knowledge base | ❌ No |
| **Record Lookup** | Look up records by ID | ❌ No |
| **Mock Task** | Create, list, and update tasks | ✅ Yes (create/update) |

---

## 🧪 Testing Guide

### Test the Application

1. **Create a Skill**:
   - Go to Skills → New Skill
   - Fill in name, purpose, instructions
   - Select allowed tools
   - Set status (draft/published)

2. **Test a Skill**:
   - Click "Test" on any skill
   - Enter sample input as JSON
   - Click "Execute Skill"
   - Watch real-time execution logs

3. **Approve Actions**:
   - For skills requiring approval
   - Click "Approve" or "Reject" when prompted

4. **View History**:
   - Go to History page
   - See all executions with status
   - Click "Show Details" for logs

### Sample Test Inputs

```json
// Calculator
{"expression": "25 + 30"}

// Document Search
{"query": "api_testing"}

// Record Lookup
{"record_id": "user_123"}

// Mock Task - Create
{"action": "create", "title": "Test Task"}

// Mock Task - List
{"action": "list"}
```

---

## 🚀 Deployment

### Deploy to Render (Backend)

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - **Root Directory**: `backend`
6. Add environment variables:
   - `GEMINI_API_KEY`
   - `DATABASE_URL`
   - `DEBUG=False`

### Deploy to Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variable:
   - `REACT_APP_API_URL` = your backend URL

### Deploy with Docker

```bash
docker-compose up --build
```

---

## ⚠️ Known Limitations

- Single user (no authentication - intentionally excluded)
- SQLite database (not production scale)
- Hardcoded knowledge base for document search
- Gemini API rate limits (250 requests/day free tier)
- No skill import/export functionality

---

## 📝 Intentionally Left Out

- User authentication (not specified in requirements)
- Multi-user support
- Advanced error recovery
- Skill templates
- API rate limiting
- Production database (PostgreSQL)

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

Built as a submission for the AGGROSO assignment - Option B (Hard Difficulty).

---

**For any questions, please refer to the assignment email from AGGROSO.**