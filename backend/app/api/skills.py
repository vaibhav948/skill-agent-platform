from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.skill import Skill
from app.models.skill_version import SkillVersion
from app.schemas.skill_schemas import SkillCreate, SkillUpdate, SkillResponse
from app.tools import ToolRegistry
from datetime import datetime

router = APIRouter()
tool_registry = ToolRegistry()

# ✅ Helper function to save version
def save_version(skill: Skill, db: Session, change_summary: str = None):
    """Save current skill state as a version"""
    version = SkillVersion(
        skill_id=skill.id,
        version=skill.version,
        name=skill.name,
        purpose=skill.purpose,
        instructions=skill.instructions,
        input_schema=skill.input_schema,
        output_schema=skill.output_schema,
        examples=skill.examples,
        allowed_tools=skill.allowed_tools,
        requires_approval=skill.requires_approval,
        max_steps=skill.max_steps,
        status=skill.status,
        change_summary=change_summary or f"Version {skill.version}"
    )
    db.add(version)
    db.commit()

@router.get("/", response_model=List[SkillResponse])
async def get_skills(db: Session = Depends(get_db)):
    return db.query(Skill).all()

@router.get("/published", response_model=List[SkillResponse])
async def get_published_skills(db: Session = Depends(get_db)):
    return db.query(Skill).filter(Skill.status == "published").all()

@router.post("/", response_model=SkillResponse)
async def create_skill(skill: SkillCreate, db: Session = Depends(get_db)):
    for tool_name in skill.allowed_tools:
        if not tool_registry.get_tool(tool_name):
            raise HTTPException(400, f"Tool '{tool_name}' not found")
    
    db_skill = Skill(**skill.dict())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    
    # ✅ Save initial version if published
    if skill.status == "published":
        save_version(db_skill, db, f"Initial version {db_skill.version}")
    
    return db_skill

@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(404, "Skill not found")
    return skill

@router.get("/{skill_id}/versions", response_model=List[dict])
async def get_skill_versions(skill_id: int, db: Session = Depends(get_db)):
    """Get all versions of a skill"""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(404, "Skill not found")
    
    versions = db.query(SkillVersion).filter(SkillVersion.skill_id == skill_id).order_by(SkillVersion.version.asc()).all()
    
    return [
        {
            "version": v.version,
            "name": v.name,
            "purpose": v.purpose,
            "instructions": v.instructions,
            "input_schema": v.input_schema,
            "output_schema": v.output_schema,
            "allowed_tools": v.allowed_tools,
            "requires_approval": v.requires_approval,
            "max_steps": v.max_steps,
            "status": v.status,
            "change_summary": v.change_summary,
            "created_at": v.created_at,
            "is_latest": v.version == skill.version
        }
        for v in versions
    ]

@router.put("/{skill_id}", response_model=SkillResponse)
async def update_skill(skill_id: int, skill_update: SkillUpdate, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(404, "Skill not found")
    
    # ✅ Store OLD values BEFORE any changes
    old_name = skill.name
    old_purpose = skill.purpose
    old_instructions = skill.instructions
    old_input_schema = skill.input_schema
    old_output_schema = skill.output_schema
    old_examples = skill.examples
    old_tools = skill.allowed_tools
    old_approval = skill.requires_approval
    old_max_steps = skill.max_steps
    old_status = skill.status
    old_version = skill.version  # ✅ Store old version number
    
    # Track changes
    changes = []
    if skill_update.name and skill_update.name != skill.name:
        changes.append(f"name: '{skill.name}' → '{skill_update.name}'")
    if skill_update.purpose and skill_update.purpose != skill.purpose:
        changes.append(f"purpose: '{skill.purpose}' → '{skill_update.purpose}'")
    if skill_update.instructions and skill_update.instructions != skill.instructions:
        changes.append(f"instructions updated")
    if skill_update.max_steps and skill_update.max_steps != skill.max_steps:
        changes.append(f"max_steps: {skill.max_steps} → {skill_update.max_steps}")
    if skill_update.allowed_tools and skill_update.allowed_tools != skill.allowed_tools:
        changes.append(f"tools updated")
    if skill_update.requires_approval and skill_update.requires_approval != skill.requires_approval:
        changes.append(f"approval settings updated")
    if skill_update.status and skill_update.status != skill.status:
        changes.append(f"status: {skill.status} → {skill_update.status}")
    
    # If no changes, return early
    if not changes:
        return skill
    
    # ✅ Save OLD state as version with OLD version number
    if skill.status == "published":
        version_entry = SkillVersion(
            skill_id=skill.id,
            version=old_version,  # ✅ Use OLD version number
            name=old_name,
            purpose=old_purpose,
            instructions=old_instructions,
            input_schema=old_input_schema,
            output_schema=old_output_schema,
            examples=old_examples,
            allowed_tools=old_tools,
            requires_approval=old_approval,
            max_steps=old_max_steps,
            status=old_status,
            change_summary=f"v{old_version} - {', '.join(changes)}"
        )
        db.add(version_entry)
        db.commit()
    
    # ✅ Apply updates
    update_data = skill_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(skill, key, value)
    
    # ✅ Increment version
    skill.version += 1
    
    db.commit()
    db.refresh(skill)
    
    return skill

@router.delete("/{skill_id}")
async def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(404, "Skill not found")
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted"}

@router.post("/{skill_id}/publish", response_model=SkillResponse)
async def publish_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(404, "Skill not found")
    
    skill.status = "published"
    skill.version += 1
    db.commit()
    db.refresh(skill)
    
    # ✅ Save version after publishing
    save_version(skill, db, f"Published version {skill.version}")
    
    return skill