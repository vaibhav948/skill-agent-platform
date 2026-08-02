# Skill Agent Platform

A dynamic user-defined skills agent platform where users can create reusable AI skills with tools, approvals, and execution tracking.

## Features

- ✅ Create skills with name, purpose, instructions, and schemas
- ✅ Define allowed tools (calculator, document search, record lookup, mock task)
- ✅ Mark tools requiring human approval
- ✅ Test skills with custom input
- ✅ Step-by-step execution with real-time logging
- ✅ Approval workflow for write actions
- ✅ Execution history with detailed logs
- ✅ Version tracking for skills

## Tech Stack

- **Backend**: Python FastAPI, SQLAlchemy, OpenAI
- **Frontend**: React, Tailwind CSS, Monaco Editor
- **Database**: SQLite

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API Key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your OPENAI_API_KEY to .env
uvicorn app.main:app --reload