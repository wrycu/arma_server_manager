"""Pytest configuration and fixtures."""

from collections.abc import Generator

import pytest
from flask import Flask
from flask.testing import FlaskClient

from app import create_app, db


@pytest.fixture
def app() -> Generator[Flask, None, None]:
    """Create and configure a test Flask application."""
    app = create_app("testing")

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    """Create a test client for the Flask application."""
    return app.test_client()
