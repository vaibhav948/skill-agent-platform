from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.execution import Execution
from app.models.skill import Skill
from app.schemas.execution_schemas import ExecutionCreate, ExecutionResponse, ExecutionApproval
from app.execution.engine import ExecutionEngine

router = APIRouter()
execution_engine = ExecutionEngine()

@router.post("/", response_model=ExecutionResponse)
async def create_execution(
    execution_data: ExecutionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create and start a new execution"""
    # Get the skill
    skill = db.query(Skill).filter(Skill.id == execution_data.skill_id).first()
    if not skill:
        raise HTTPException(404, "Skill not found")
    
    # ✅ Use the requested version or default to current version
    version_to_use = execution_data.skill_version or skill.version
    
    # Create execution record with version
    db_execution = Execution(
        skill_id=skill.id,
        skill_version=version_to_use,  # ✅ Use the version
        input_data=execution_data.input_data,
        status="pending"
    )
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    
    # Start execution in background
    background_tasks.add_task(
        execution_engine.execute,
        db_execution.id,
        db
    )
    
    return db_execution

@router.get("/", response_model=List[ExecutionResponse])
async def get_executions(
    skill_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all executions, optionally filtered by skill"""
    query = db.query(Execution)
    if skill_id:
        query = query.filter(Execution.skill_id == skill_id)
    return query.order_by(Execution.created_at.desc()).all()

@router.get("/{execution_id}", response_model=ExecutionResponse)
async def get_execution(execution_id: int, db: Session = Depends(get_db)):
    """Get execution status and details"""
    execution = db.query(Execution).filter(Execution.id == execution_id).first()
    if not execution:
        raise HTTPException(404, "Execution not found")
    return execution

@router.post("/{execution_id}/approve")
async def approve_step(
    execution_id: int,
    approval: ExecutionApproval,
    db: Session = Depends(get_db)
):
    """Approve or reject a step requiring approval"""
    execution = db.query(Execution).filter(Execution.id == execution_id).first()
    if not execution:
        raise HTTPException(404, "Execution not found")
    
    result = execution_engine.handle_approval(
        execution_id,
        approval.step_id,
        approval.approved,
        db
    )
    
    return result

@router.post("/{execution_id}/cancel")
async def cancel_execution(execution_id: int, db: Session = Depends(get_db)):
    """Cancel a running execution"""
    execution = db.query(Execution).filter(Execution.id == execution_id).first()
    if not execution:
        raise HTTPException(404, "Execution not found")
    
    if execution.status in ["completed", "failed", "cancelled"]:
        raise HTTPException(400, "Execution already finished")
    
    execution.status = "cancelled"
    db.commit()
    
    return {"message": "Execution cancelled"}