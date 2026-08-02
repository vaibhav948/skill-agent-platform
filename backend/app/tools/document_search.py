from typing import Any, Dict
from app.tools.base import BaseTool

class DocumentSearchTool(BaseTool):
    # Mock document database
    DOCUMENTS = {
        "api": "API documentation: GET /users returns list of users, POST /users creates a user",
        "database": "Database schema: users(id, name, email), posts(id, user_id, title, content)",
        "auth": "Authentication: JWT tokens with 24h expiry, refresh tokens valid for 7 days",
        "performance_testing": """
        PERFORMANCE TESTING GUIDELINES:
        - Test API response times under normal load (< 200ms)
        - Test API response times under peak load (< 500ms)
        - Test with 100+ concurrent users
        - Monitor memory usage (should not exceed 1GB)
        - Monitor CPU usage (should not exceed 70%)
        - Test database query performance (optimize slow queries)
        - Test with large payloads (1MB+)
        - Test caching effectiveness
        - Identify and fix performance bottlenecks
        - Test load balancing and horizontal scaling
        - Test connection pooling and database connections
        - Test for memory leaks over extended periods
        """,
        "e2e_testing": """
        END TO END TESTING GUIDELINES:
        - Test complete user workflows from start to finish
        - Test user signup → email verification → login → dashboard → logout
        - Test user login → search → view results → export data → logout
        - Test admin login → manage users → view reports → logout
        - Test API request → database query → response → UI update
        - Test with real data (or realistic test data)
        - Test error scenarios and edge cases in real workflow
        - Test with multiple user roles and permissions
        - Verify all integrated components work together
        - Test in staging environment (production-like)
        - Run E2E tests on every release candidate
        """,
        "test_coverage": """
        TEST COVERAGE GUIDELINES:
        - Aim for 80%+ overall code coverage
        - Cover all critical paths (happy path + error paths)
        - Cover edge cases and boundary conditions
        - Cover permission cases (admin, user, guest)
        - Cover failure states (timeouts, errors, exceptions)
        - Cover all API endpoints and routes
        - Cover all database operations and queries
        - Identify uncovered code and prioritize adding tests
        - Use coverage reports to track progress
        - Set minimum coverage thresholds in CI/CD
        - Track coverage trends over time
        - Use mutation testing for better test quality
        """,
    }

    @property
    def name(self) -> str:
        return "document_search"

    @property
    def description(self) -> str:
        return "Search through documentation and knowledge base"

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        query = params.get("query", "").lower()
        
        # Simple search implementation
        results = []
        for key, content in self.DOCUMENTS.items():
            if query in key.lower() or query in content.lower():
                results.append({
                    "topic": key,
                    "content": content,
                    "relevance": 0.8 if query in key.lower() else 0.5
                })
        
        if not results:
            return {"results": [], "message": "No documents found matching your query"}
        
        return {"results": results}

    def get_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query to find relevant documentation"
                }
            },
            "required": ["query"]
        }