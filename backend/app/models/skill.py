from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    purpose = Column(Text, nullable=False)
    instructions = Column(Text, nullable=False)
    input_schema = Column(JSON, nullable=False)
    output_schema = Column(JSON, nullable=False)
    examples = Column(JSON, nullable=False, default=[])
    allowed_tools = Column(JSON, nullable=False, default=[])
    requires_approval = Column(JSON, nullable=False, default=[])
    max_steps = Column(Integer, nullable=False, default=10)
    version = Column(Integer, nullable=False, default=1)
    status = Column(String(20), nullable=False, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # ✅ Add version history as JSON
    version_history = Column(JSON, nullable=True, default=[])