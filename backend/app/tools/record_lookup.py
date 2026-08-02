from typing import Any, Dict
from app.tools.base import BaseTool

class RecordLookupTool(BaseTool):
    # Mock database
    RECORDS = {
        "user_123": {"name": "John Doe", "email": "john@example.com", "role": "admin"},
        "user_456": {"name": "Jane Smith", "email": "jane@example.com", "role": "user"},
        "product_001": {"name": "Laptop", "price": 999.99, "stock": 10},
        "product_002": {"name": "Mouse", "price": 29.99, "stock": 50}
    }

    @property
    def name(self) -> str:
        return "record_lookup"

    @property
    def description(self) -> str:
        return "Look up structured records by ID"

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        record_id = params.get("record_id")
        if not record_id:
            return {"error": "Missing record_id parameter"}
        
        if record_id in self.RECORDS:
            return {
                "found": True,
                "record": self.RECORDS[record_id]
            }
        else:
            return {
                "found": False,
                "message": f"Record '{record_id}' not found"
            }

    def get_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "record_id": {
                    "type": "string",
                    "description": "ID of the record to look up"
                }
            },
            "required": ["record_id"]
        }