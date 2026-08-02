import json
from google import genai
from typing import List, Dict, Any
from app.tools import ToolRegistry
import os
import re

class SkillPlanner:
    def __init__(self):
        self.tool_registry = ToolRegistry()
        
        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ GEMINI_API_KEY not found, using mock mode")
            self.use_mock = True
        else:
            self.use_mock = False
            self.client = genai.Client(api_key=api_key)
            self.model = "gemini-3.5-flash-lite"

    def create_plan(self, skill: Dict[str, Any], input_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate an execution plan"""
        
        print(f"📝 Creating plan for skill: {skill.get('name')}")
        print(f"📥 Input data: {input_data}")
        
        # If mock mode, generate plan directly
        if self.use_mock:
            return self._create_mock_plan(skill, input_data)
        
        # Get tool descriptions
        tool_descriptions = []
        for tool_name in skill.get("allowed_tools", []):
            tool = self.tool_registry.get_tool(tool_name)
            if tool:
                tool_descriptions.append({
                    "name": tool_name,
                    "description": tool.description,
                    "schema": tool.get_schema()
                })

        prompt = f"""
You are an AI assistant executing a skill.

Skill Name: {skill.get('name')}
Skill Purpose: {skill.get('purpose')}
Instructions: {skill.get('instructions')}
Max Steps: {skill.get('max_steps', 10)}

Available Tools:
{json.dumps(tool_descriptions, indent=2)}

Input Data:
{json.dumps(input_data, indent=2)}

Create a step-by-step plan to accomplish this task. Each step should use one of the available tools.

Return ONLY a JSON array of steps. Each step must have:
- "step": step number (starting from 1)
- "tool": tool name (must be from available tools)
- "params": object with parameters for the tool
- "reason": why this step is needed

Example format:
[
    {{"step": 1, "tool": "calculator", "params": {{"expression": "2+2"}}, "reason": "Calculate"}}
]

Plan:
"""
        
        try:
            print("🤖 Calling Gemini API...")
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            
            response_text = response.text
            print(f"📥 Raw response: {response_text[:200]}...")
            
            # Find JSON in the response
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                plan_data = json.loads(json_match.group())
            else:
                plan_data = json.loads(response_text)
            
            steps = plan_data if isinstance(plan_data, list) else plan_data.get("steps", [])
            
            # Validate steps
            valid_steps = []
            for step in steps:
                if "tool" in step and "params" in step:
                    if step["tool"] in skill.get("allowed_tools", []):
                        valid_steps.append(step)
            
            print(f"✅ Generated {len(valid_steps)} valid steps")
            
            if not valid_steps:
                print("⚠️ No valid steps, using fallback")
                return self._create_fallback_plan(skill, input_data)
            
            return valid_steps
            
        except Exception as e:
            print(f"❌ Planning error: {e}")
            return self._create_fallback_plan(skill, input_data)
    
    def _create_mock_plan(self, skill: Dict[str, Any], input_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create a mock plan without API"""
        print("📋 Using mock plan")
        allowed_tools = skill.get("allowed_tools", [])
        
        if "calculator" in allowed_tools:
            expression = input_data.get("expression", "1+1")
            return [
                {
                    "step": 1,
                    "tool": "calculator",
                    "params": {"expression": expression},
                    "reason": f"Calculate {expression}"
                }
            ]
        elif "mock_task" in allowed_tools:
            return [
                {
                    "step": 1,
                    "tool": "mock_task",
                    "params": input_data,
                    "reason": "Execute mock_task"
                }
            ]
        else:
            return self._create_fallback_plan(skill, input_data)
    
    def _create_fallback_plan(self, skill: Dict[str, Any], input_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create a fallback plan"""
        print("📋 Using fallback plan")
        return [
            {
                "step": 1,
                "tool": "calculator",
                "params": {"expression": "1+1"},
                "reason": "Fallback calculation"
            }
        ]