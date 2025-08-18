"""Flask application factory with Celery integration."""

import os

from celery import Celery, Task
from celery.schedules import crontab
from dotenv import load_dotenv
from flask import Flask, Response
from flask_cors import CORS  # type: ignore[import-untyped]
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
celery = Celery(__name__)


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure Flask application.

    Args:
        config_name: Configuration environment name

    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)
    # load .env file
    load_dotenv()

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
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Configure Celery
    celery.conf.update(app.config)
    # set up a kick-off job to launch other scheduled activities
    celery.conf.beat_schedule = {
        "every_10_seconds": {
            "task": "app.tasks.background.task_kickoff",
            "schedule": 10,
            "args": ["every_10_seconds"],
        },
        "every_hour": {
            "task": "app.tasks.background.task_kickoff",
            "schedule": crontab(minute=0, hour="*"),
            "args": ["every_hour"],
        },
        "every_day": {
            "task": "app.tasks.background.task_kickoff",
            "schedule": crontab(minute=0, hour=6, day_of_week="*"),
            "args": ["every_day"],
        },
        "every_sunday": {
            "task": "app.tasks.background.task_kickoff",
            "schedule": crontab(minute=0, hour=6, day_of_week=0),
            "args": ["every_sunday"],
        },
        "every_month": {
            "task": "app.tasks.background.task_kickoff",
            "schedule": crontab(minute=0, hour=6, day_of_month=1),
            "args": ["every_month"],
        },
        "update_mod_metadata": {
            "task": "app.tasks.background.update_mod_steam_updated_time",
            "schedule": crontab(minute=0, hour="*"),  # hourly
            "args": [],
        },
    }

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

    class ContextTask(Task):
        """Make celery tasks work with Flask app context."""

        def __call__(self, *args, **kwargs):  # type: ignore[no-untyped-def]
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    celery.autodiscover_tasks(["app.tasks.background"])

    return app


if __name__ == "app":
    create_app()
