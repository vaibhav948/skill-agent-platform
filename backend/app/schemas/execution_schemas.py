from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class ExecutionCreate(BaseModel):
    skill_id: int
    skill_version: Optional[int] = None  # ✅ ADD THIS - allows selecting specific version
    input_data: Dict[str, Any]

class ExecutionApproval(BaseModel):
    step_id: str
    approved: bool

class ExecutionResponse(BaseModel):
    id: int
    skill_id: int
    skill_version: int
    input_data: Dict[str, Any]
    status: str
    plan: Optional[List[Dict[str, Any]]] = None
    current_step: int
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    execution_log: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True