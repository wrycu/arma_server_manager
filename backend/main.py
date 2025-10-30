"""Application entry point for Flask development server."""

from app import create_app, db

app = create_app()


@app.shell_context_processor
def make_shell_context() -> dict[str, object]:
    """Add database and models to Flask shell context."""
    return {"db": db}


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        app.config["A3_SERVER_HELPER"].create_basic_server()
        app.config["MOD_MANAGERS"]["ARMA3"].empty_mod_staging_dir()

    debug_mode = app.config.get("DEBUG", False)
    app.run(debug=debug_mode, host="0.0.0.0", port=5000)
