"""Command-line entry points for the application."""

import multiprocessing
import signal
import sys

from app import celery, create_app, db


def _run_server():
    """Internal function to run the server in a separate process."""
    # Create app in production mode
    app = create_app("production")

    # Initialize database on startup
    with app.app_context():
        db.create_all()
        # Create basic server configuration if it doesn't exist
        try:
            from app.config import Config

            config = Config()
            config.A3_SERVER_HELPER.create_basic_server()
        except Exception as e:
            app.logger.warning(f"Could not create basic server: {e}")

        # Clean mod staging directory
        try:
            from app.config import Config

            config = Config()
            config.MOD_MANAGERS["ARMA3"].empty_mod_staging_dir()
        except Exception as e:
            app.logger.warning(f"Could not empty mod staging directory: {e}")

    # Run with Gunicorn if available, otherwise Flask dev server
    try:
        import os

        import gunicorn.app.wsgiapp as wsgi_app  # noqa: PLC0415

        # Configure Gunicorn programmatically (gunicorn.conf.py may not be accessible when installed)
        port = os.environ.get("PORT", "5000")
        workers = int(
            os.environ.get("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1)
        )

        sys.argv = [
            "gunicorn",
            "app.cli:app",
            "--bind",
            f"0.0.0.0:{port}",
            "--workers",
            str(workers),
            "--worker-class",
            "sync",
            "--timeout",
            "120",
            "--access-logfile",
            os.environ.get("GUNICORN_ACCESS_LOG", "-"),
            "--error-logfile",
            os.environ.get("GUNICORN_ERROR_LOG", "-"),
            "--log-level",
            os.environ.get("GUNICORN_LOG_LEVEL", "info"),
        ]
        wsgi_app.run()
    except ImportError:
        # Fallback to Flask dev server
        app.run(host="0.0.0.0", port=5000)


def _run_celery():
    """Internal function to run Celery worker in a separate process."""
    # Create app to initialize Celery with proper config
    # The app creation is necessary to initialize Celery with Flask config
    _ = create_app("production")  # noqa: F841

    # Run celery worker
    celery.worker_main(
        [
            "worker",
            "--loglevel=info",
            "--pool=solo",
            "--concurrency=1",
        ]
    )


def main_server():
    """Main entry point - runs both server and Celery worker."""
    # Create app to initialize everything
    app = create_app("production")

    # Initialize database on startup
    with app.app_context():
        db.create_all()
        # Create basic server configuration if it doesn't exist
        try:
            from app.config import Config

            config = Config()
            config.A3_SERVER_HELPER.create_basic_server()
        except Exception as e:
            app.logger.warning(f"Could not create basic server: {e}")

        # Clean mod staging directory
        try:
            from app.config import Config

            config = Config()
            config.MOD_MANAGERS["ARMA3"].empty_mod_staging_dir()
        except Exception as e:
            app.logger.warning(f"Could not empty mod staging directory: {e}")

    # Set up signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        """Handle shutdown signals."""
        print("\nShutting down server and Celery worker...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Start server and Celery worker in separate processes
    server_process = multiprocessing.Process(target=_run_server, name="Server")
    celery_process = multiprocessing.Process(target=_run_celery, name="Celery")

    server_process.start()
    celery_process.start()

    print("Server and Celery worker started. Press Ctrl+C to stop both.")

    try:
        # Wait for both processes
        server_process.join()
        celery_process.join()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server_process.terminate()
        celery_process.terminate()
        server_process.join(timeout=5)
        celery_process.join(timeout=5)
        if server_process.is_alive():
            server_process.kill()
        if celery_process.is_alive():
            celery_process.kill()


# Create app instance for Gunicorn
app = create_app("production")

# Initialize database on startup (needed when Gunicorn loads this module)
with app.app_context():
    db.create_all()
    # Create basic server configuration if it doesn't exist
    try:
        from app.config import Config

        config = Config()
        config.A3_SERVER_HELPER.create_basic_server()
    except Exception as e:
        app.logger.warning(f"Could not create basic server: {e}")

    # Clean mod staging directory
    try:
        from app.config import Config

        config = Config()
        config.MOD_MANAGERS["ARMA3"].empty_mod_staging_dir()
    except Exception as e:
        app.logger.warning(f"Could not empty mod staging directory: {e}")
