from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

class SkillVersion(Base):
    __tablename__ = "skill_versions"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    version = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    purpose = Column(Text, nullable=False)
    instructions = Column(Text, nullable=False)
    input_schema = Column(JSON, nullable=False)
    output_schema = Column(JSON, nullable=False)
    examples = Column(JSON, nullable=False, default=[])
    allowed_tools = Column(JSON, nullable=False, default=[])
    requires_approval = Column(JSON, nullable=False, default=[])
    max_steps = Column(Integer, nullable=False, default=10)
    status = Column(String(20), nullable=False, default="draft")
    change_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())