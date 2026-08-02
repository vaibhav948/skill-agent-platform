from app.tools.calculator import CalculatorTool
from app.tools.document_search import DocumentSearchTool
from app.tools.record_lookup import RecordLookupTool
from app.tools.mock_task import MockTaskTool
from typing import Dict, Any

class ToolRegistry:
    def __init__(self):
        self.tools = {
            "calculator": CalculatorTool(),
            "document_search": DocumentSearchTool(),
            "record_lookup": RecordLookupTool(),
            "mock_task": MockTaskTool()
        }

    def get_tool(self, name: str):
        return self.tools.get(name)

    def get_all_tools(self):
        return list(self.tools.keys())

    def get_tool_schemas(self):
        schemas = {}
        for name, tool in self.tools.items():
            schemas[name] = {
                "description": tool.description,
                "schema": tool.get_schema()
            }
        return schemas

    def execute_tool(self, name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        tool = self.get_tool(name)
        if not tool:
            return {"error": f"Tool '{name}' not found"}
        return tool.execute(params)