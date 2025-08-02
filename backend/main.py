"""Application entry point for Flask development server."""

from app import create_app
from app.database import db

app = create_app()


@app.shell_context_processor
def make_shell_context() -> dict[str, object]:
    """Add database and models to Flask shell context."""
    return {"db": db}


if __name__ == "__main__":
    debug_mode = app.config.get("DEBUG", False)
    app.run(debug=debug_mode, host="0.0.0.0", port=5000)
