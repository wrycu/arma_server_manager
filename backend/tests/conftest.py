"""Pytest configuration and fixtures."""

from collections.abc import Generator

import pytest
from flask import Flask
from flask.testing import FlaskClient

from app import create_app
from app.database import create_tables, db


@pytest.fixture
def app() -> Generator[Flask, None, None]:
    """Create and configure a test Flask application."""
    app = create_app("testing")

    with app.app_context():
        create_tables()
        yield app
        # Peewee doesn't have drop_all, but we can drop the tables manually if needed
        from app.models.collection import Collection
        from app.models.mod import Mod
        from app.models.mod_collection_entry import ModCollectionEntry
        from app.models.mod_image import ModImage
        from app.models.server_config import ServerConfig

        db.drop_tables(
            [Mod, Collection, ModCollectionEntry, ModImage, ServerConfig], safe=True
        )


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    """Create a test client for the Flask application."""
    return app.test_client()
