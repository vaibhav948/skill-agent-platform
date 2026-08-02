from fastapi import APIRouter
from app.tools import ToolRegistry

router = APIRouter()
tool_registry = ToolRegistry()

@router.get("/")
async def get_tools():
    """Get all available tools"""
    return {
        "tools": tool_registry.get_all_tools(),
        "schemas": tool_registry.get_tool_schemas()
    }

@router.get("/{tool_name}")
async def get_tool(tool_name: str):
    """Get a specific tool's details"""
    tool = tool_registry.get_tool(tool_name)
    if not tool:
        return {"error": f"Tool '{tool_name}' not found"}
    
    return {
        "name": tool.name,
        "description": tool.description,
        "schema": tool.get_schema()
    }