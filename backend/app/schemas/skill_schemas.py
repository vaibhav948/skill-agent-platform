from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class SkillBase(BaseModel):
    name: str
    purpose: str
    instructions: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    examples: List[str] = []
    allowed_tools: List[str] = []
    requires_approval: List[str] = []
    max_steps: int = 10
    status: str = "draft"

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    purpose: Optional[str] = None
    instructions: Optional[str] = None
    input_schema: Optional[Dict[str, Any]] = None
    output_schema: Optional[Dict[str, Any]] = None
    examples: Optional[List[str]] = None
    allowed_tools: Optional[List[str]] = None
    requires_approval: Optional[List[str]] = None
    max_steps: Optional[int] = None
    status: Optional[str] = None

class SkillResponse(SkillBase):
    id: int
    version: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True