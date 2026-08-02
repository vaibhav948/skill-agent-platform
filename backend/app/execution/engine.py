import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.execution import Execution
from app.models.skill import Skill
from app.tools import ToolRegistry
from app.agents.planner import SkillPlanner
from datetime import datetime

class ExecutionEngine:
    def __init__(self):
        self.tool_registry = ToolRegistry()
        self.planner = SkillPlanner()
        self.approved_actions = set()

    def execute(self, execution_id: int, db: Session):
        """Execute a skill plan"""
        print(f"🚀 Starting execution {execution_id}")
        
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            print(f"❌ Execution {execution_id} not found")
            return
        
        skill = db.query(Skill).filter(Skill.id == execution.skill_id).first()
        if not skill:
            execution.status = "failed"
            execution.error_message = "Skill not found"
            db.commit()
            return

        # Generate plan
        plan = self.planner.create_plan(
            {
                "name": skill.name,
                "purpose": skill.purpose,
                "instructions": skill.instructions,
                "allowed_tools": skill.allowed_tools,
                "max_steps": skill.max_steps
            },
            execution.input_data
        )

        if not plan:
            execution.status = "failed"
            execution.error_message = "Failed to generate execution plan"
            db.commit()
            return

        execution.plan = plan
        execution.status = "running"
        execution.execution_log = []
        db.commit()
        
        print(f"📋 Plan: {plan}")

        # Execute steps
        for step_idx, step in enumerate(plan):
            print(f"📍 Step {step_idx + 1}: {step}")
            execution.current_step = step_idx
            db.commit()

            if step_idx >= skill.max_steps:
                execution.status = "failed"
                execution.error_message = f"Max steps ({skill.max_steps}) exceeded"
                db.commit()
                return

            tool_name = step.get("tool")
            if tool_name not in skill.allowed_tools:
                execution.status = "failed"
                execution.error_message = f"Tool '{tool_name}' not allowed"
                db.commit()
                return

            tool = self.tool_registry.get_tool(tool_name)
            if not tool:
                execution.status = "failed"
                execution.error_message = f"Tool '{tool_name}' not found"
                db.commit()
                return

            step_id = f"{execution_id}_{step_idx}"
            if tool_name in skill.requires_approval:
                execution.status = "awaiting_approval"
                new_log = []
                if execution.execution_log:
                    new_log = execution.execution_log.copy()
                new_log.append({
                    "step": step_idx,
                    "tool": tool_name,
                    "params": step.get("params", {}),
                    "reason": step.get("reason", ""),
                    "status": "awaiting_approval"
                })
                execution.execution_log = new_log
                db.commit()
                return

            # Execute tool
            try:
                print(f"🔧 Executing: {tool_name} with params: {step.get('params', {})}")
                result = tool.execute(step.get("params", {}))
                print(f"✅ Result: {result}")
                
                new_log = []
                if execution.execution_log:
                    new_log = execution.execution_log.copy()
                new_log.append({
                    "step": step_idx,
                    "tool": tool_name,
                    "params": step.get("params", {}),
                    "reason": step.get("reason", ""),
                    "result": result,
                    "status": "completed"
                })
                execution.execution_log = new_log
                db.commit()
                print(f"📝 Log saved: {len(new_log)} entries")
                
            except Exception as e:
                execution.status = "failed"
                execution.error_message = f"Tool error: {str(e)}"
                db.commit()
                return

        # Complete execution
        print(f"🏁 Completing execution {execution_id}")
        execution.status = "completed"
        execution.completed_at = datetime.now()
        
        # Get result from last step
        output_data = {"message": "No result"}
        if execution.execution_log and len(execution.execution_log) > 0:
            last_step = execution.execution_log[-1]
            if last_step.get("result"):
                output_data = last_step["result"]
                print(f"📤 Output from last step: {output_data}")
        
        execution.output_data = output_data
        db.commit()
        
        print(f"✅ Execution {execution_id} completed")
        print(f"📊 Final log: {execution.execution_log}")
        print(f"📤 Final output: {execution.output_data}")

    def handle_approval(self, execution_id: int, step_id: str, approved: bool, db: Session):
        """Handle approval or rejection"""
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            return {"error": "Execution not found"}

        approval_key = f"{execution_id}_{step_id}"
        if approval_key in self.approved_actions:
            return {"error": "Already processed"}

        if not approved:
            execution.status = "failed"
            execution.error_message = "Step rejected"
            db.commit()
            return {"status": "rejected"}

        self.approved_actions.add(approval_key)

        plan = execution.plan
        step_idx = int(step_id.split("_")[1])
        if step_idx >= len(plan):
            return {"error": "Step not found"}

        step = plan[step_idx]
        tool_name = step.get("tool")
        tool = self.tool_registry.get_tool(tool_name)
        
        if not tool:
            return {"error": "Tool not found"}

        skill = db.query(Skill).filter(Skill.id == execution.skill_id).first()

        try:
            result = tool.execute(step.get("params", {}))
            new_log = []
            if execution.execution_log:
                new_log = execution.execution_log.copy()
            new_log.append({
                "step": step_idx,
                "tool": tool_name,
                "params": step.get("params", {}),
                "reason": step.get("reason", ""),
                "result": result,
                "status": "approved"
            })
            execution.execution_log = new_log
            
            execution.status = "running"
            db.commit()
            
            # Continue remaining steps
            for next_idx in range(step_idx + 1, len(plan)):
                next_step = plan[next_idx]
                next_tool_name = next_step.get("tool")
                next_tool = self.tool_registry.get_tool(next_tool_name)
                
                if not next_tool:
                    execution.status = "failed"
                    execution.error_message = f"Tool '{next_tool_name}' not found"
                    db.commit()
                    break
                
                if next_tool_name in skill.requires_approval:
                    execution.status = "awaiting_approval"
                    new_log_2 = []
                    if execution.execution_log:
                        new_log_2 = execution.execution_log.copy()
                    new_log_2.append({
                        "step": next_idx,
                        "tool": next_tool_name,
                        "params": next_step.get("params", {}),
                        "reason": next_step.get("reason", ""),
                        "status": "awaiting_approval"
                    })
                    execution.execution_log = new_log_2
                    db.commit()
                    return {"status": "awaiting_approval", "step": next_idx}
                
                next_result = next_tool.execute(next_step.get("params", {}))
                new_log_3 = []
                if execution.execution_log:
                    new_log_3 = execution.execution_log.copy()
                new_log_3.append({
                    "step": next_idx,
                    "tool": next_tool_name,
                    "params": next_step.get("params", {}),
                    "reason": next_step.get("reason", ""),
                    "result": next_result,
                    "status": "completed"
                })
                execution.execution_log = new_log_3
                db.commit()
            
            if execution.status != "awaiting_approval":
                execution.status = "completed"
                execution.completed_at = datetime.now()
                
                output_data = {"message": "No result"}
                if execution.execution_log:
                    last_step = execution.execution_log[-1]
                    if last_step.get("result"):
                        output_data = last_step["result"]
                
                execution.output_data = output_data
                db.commit()
            
            return {"status": "approved", "result": result}
            
        except Exception as e:
            execution.status = "failed"
            execution.error_message = f"Tool error: {str(e)}"
            db.commit()
            return {"error": str(e)}