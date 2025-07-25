"""API endpoint tests."""

import json
from http import HTTPStatus

from flask.testing import FlaskClient


class TestHealthEndpoint:
    """Test health check endpoint."""

    def test_health_check(self, client: FlaskClient) -> None:
        """Test health check returns 200 with correct response."""
        response = client.get("/api/health")

        assert response.status_code == HTTPStatus.OK
        data = json.loads(response.data)
        assert data["status"] == "healthy"
        assert "message" in data
