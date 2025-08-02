"""Flask application factory with Celery integration."""

import os

from celery import Celery, Task
from flask import Flask, Response
from flask_cors import CORS

# Initialize extensions
celery = Celery(__name__)


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure Flask application.

    Args:
        config_name: Configuration environment name

    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)

    # Load configuration
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    if config_name == "development":
        from .config import DevelopmentConfig

        app.config.from_object(DevelopmentConfig)
    elif config_name == "production":
        from .config import ProductionConfig

        app.config.from_object(ProductionConfig())
    else:
        from .config import Config

        app.config.from_object(Config)

    # Initialize extensions with app
    CORS(app)

    # Initialize Peewee database
    from .database import create_tables

    create_tables()

    # Configure Celery
    celery.conf.update(app.config)

    # Register blueprints
    from .routes.api import api_bp
    from .routes.arma3 import a3_bp

    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(a3_bp, url_prefix="/api/arma3")

    # Serve static files in production
    if config_name == "production":
        from flask import send_from_directory

        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_static(path: str) -> Response:
            """Serve React static files in production."""
            static_dir = os.path.join(app.root_path, "static")
            if path != "" and os.path.exists(os.path.join(static_dir, path)):
                return send_from_directory(static_dir, path)
            else:
                return send_from_directory(static_dir, "index.html")

    return app


def make_celery(app: Flask) -> Celery:
    """Create Celery instance with Flask app context.

    Args:
        app: Flask application instance

    Returns:
        Configured Celery instance
    """
    celery.conf.update(app.config)

    class ContextTask(Task):
        """Make celery tasks work with Flask app context."""

        def __call__(self, *args, **kwargs):  # type: ignore[no-untyped-def]
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery
