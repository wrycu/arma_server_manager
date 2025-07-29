"""API routes with proper type hints and documentation."""

from http import HTTPStatus
from flask import Blueprint

api_bp = Blueprint("api", __name__)


@api_bp.route("/health", methods=["GET"])
def health_check() -> tuple[dict[str, str], int]:
    """Health check endpoint for monitoring.

    Returns:
        JSON response with health status and HTTP 200
    """
    return {"status": "healthy", "message": "API is running"}, HTTPStatus.OK
