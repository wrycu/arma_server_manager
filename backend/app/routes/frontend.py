from http import HTTPStatus
import os

from flask import Blueprint, Response, current_app, request, send_from_directory

frontend_bp = Blueprint("frontend", __name__)


@frontend_bp.route("/", defaults={"path": ""}, methods=["GET"])
@frontend_bp.route("/<path:path>")
def health_check(path: str) -> Response:
    """Serve React static files

    All non-API routes serve static files from the static directory.
            For SPA routing, non-existent paths serve index.html.

    Returns:
        JSON response with health status and HTTP 200
    """
    static_dir = os.path.join(current_app.root_path, "static")

    # Try to serve the requested file if it exists
    if path != "":
        file_path = os.path.join(static_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(static_dir, path)

    return send_from_directory(static_dir, "index.html")
