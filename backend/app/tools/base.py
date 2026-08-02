from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseTool(ABC):
    @abstractmethod
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the tool with given parameters"""
        pass

    @abstractmethod
    def get_schema(self) -> Dict[str, Any]:
        """Return the tool's input schema"""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """Return the tool's name"""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Return the tool's description"""
        pass