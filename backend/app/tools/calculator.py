from typing import Any, Dict
from app.tools.base import BaseTool

class CalculatorTool(BaseTool):
    @property
    def name(self) -> str:
        return "calculator"

    @property
    def description(self) -> str:
        return "Perform mathematical calculations"

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        expression = params.get("expression", "")
        try:
            # Safe eval - only allow basic math operations
            allowed = set('+-*/**(). ')
            if not all(c in allowed or c.isdigit() or c == '.' for c in expression):
                return {"error": "Invalid expression contains disallowed characters"}
            
            result = eval(expression)
            
            # ✅ FIX: Return result in a consistent format
            return {"result": result}
            
        except Exception as e:
            return {"error": str(e)}

    def get_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Mathematical expression to evaluate (e.g., '2 + 2')"
                }
            },
            "required": ["expression"]
        }