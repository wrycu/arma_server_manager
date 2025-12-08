from flask import Blueprint, Response, send_from_directory

frontend_bp = Blueprint("frontend", __name__)


@frontend_bp.route("/", methods=["GET"])
def serve_static_files() -> Response:
    """Serve React static files

    All non-API routes serve static files from the static directory.
            For SPA routing, non-existent paths serve index.html.

    Returns:
        The actual web UI (files are built)
    """

    return send_from_directory("assets", "index.html")
