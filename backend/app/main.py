from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import skills, executions, tools
from app.db.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Skill Agent Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(skills.router, prefix="/api/skills", tags=["skills"])
app.include_router(executions.router, prefix="/api/executions", tags=["executions"])
app.include_router(tools.router, prefix="/api/tools", tags=["tools"])

@app.get("/")
async def root():
    return {"message": "Skill Agent Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}