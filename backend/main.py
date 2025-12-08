"""Application entry point for Flask development server."""

import multiprocessing
import platform

from app import celery, create_app, db

app = create_app()


@app.shell_context_processor
def make_shell_context() -> dict[str, object]:
    """Add database and models to Flask shell context."""
    return {"db": db}


def _run_celery():
    celery.worker_main(
        [
            "worker",
            "--loglevel=info",
            "--pool=solo",
            "--concurrency=1",
        ]
    )


def _run_app():
    with app.app_context():
        db.create_all()
        app.config["A3_SERVER_HELPER"].create_basic_server()
        app.config["MOD_MANAGERS"]["ARMA3"].empty_mod_staging_dir()

    debug_mode = app.config.get("DEBUG", False)
    # Disable reloader on Windows when running in multiprocessing context
    # The reloader uses multiprocessing which conflicts with our Process-based setup on Windows
    use_reloader = debug_mode and platform.system() != "Windows"
    app.run(debug=debug_mode, host="0.0.0.0", port=5000, use_reloader=use_reloader)


if __name__ == "__main__":
    # Only needed on Windows (esp. with PyInstaller) to avoid
    # recursive process spawning and ensure multiprocessing works.
    if platform.system() == "Windows":
        multiprocessing.freeze_support()

    app_process = multiprocessing.Process(target=_run_app, name="app")
    celery_process = multiprocessing.Process(target=_run_celery, name="celery")

    app_process.start()
    celery_process.start()

    print("Server and Celery worker started. Press Ctrl+C to stop both.")

    try:
        # Wait for both processes
        app_process.join()
        celery_process.join()
    except KeyboardInterrupt:
        print("\nShutting down...")
        app_process.terminate()
        celery_process.terminate()
