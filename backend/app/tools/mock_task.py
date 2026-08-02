from typing import Any, Dict
from app.tools.base import BaseTool

class MockTaskTool(BaseTool):
    # Track created tasks
    created_tasks = []
    task_counter = 0

    @property
    def name(self) -> str:
        return "mock_task"

    @property
    def description(self) -> str:
        return "Create or manage mock tasks (write action - requires approval)"

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        action = params.get("action", "create")
        
        if action == "create":
            MockTaskTool.task_counter += 1
            task = {
                "id": f"task_{MockTaskTool.task_counter}",
                "title": params.get("title", "Untitled Task"),
                "description": params.get("description", ""),
                "priority": params.get("priority", "medium"),
                "status": "created"
            }
            MockTaskTool.created_tasks.append(task)
            return {
                "success": True,
                "task": task,
                "message": f"Task created successfully"
            }
        
        elif action == "list":
            return {
                "tasks": MockTaskTool.created_tasks,
                "count": len(MockTaskTool.created_tasks)
            }
        
        elif action == "update":
            task_id = params.get("task_id")
            for task in MockTaskTool.created_tasks:
                if task["id"] == task_id:
                    task["status"] = params.get("status", task["status"])
                    task["priority"] = params.get("priority", task["priority"])
                    return {
                        "success": True,
                        "task": task,
                        "message": f"Task {task_id} updated"
                    }
            return {"error": f"Task {task_id} not found"}
        
        else:
            return {"error": f"Unknown action: {action}"}

    def get_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["create", "list", "update"],
                    "description": "Action to perform on tasks"
                },
                "title": {
                    "type": "string",
                    "description": "Task title (for create action)"
                },
                "description": {
                    "type": "string",
                    "description": "Task description (for create action)"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "Task priority"
                },
                "task_id": {
                    "type": "string",
                    "description": "Task ID (for update action)"
                },
                "status": {
                    "type": "string",
                    "enum": ["created", "in_progress", "completed"],
                    "description": "Task status (for update action)"
                }
            },
            "required": ["action"]
        }