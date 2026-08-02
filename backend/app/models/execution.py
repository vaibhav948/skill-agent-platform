from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

class Execution(Base):
    __tablename__ = "executions"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    skill_version = Column(Integer, nullable=False)
    input_data = Column(JSON, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  
    # pending, running, awaiting_approval, completed, failed, cancelled
    
    plan = Column(JSON, nullable=True)  # List of steps
    current_step = Column(Integer, nullable=False, default=0)
    output_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    execution_log = Column(JSON, nullable=True, default=[])  # List of log entries
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)