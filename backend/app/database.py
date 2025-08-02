"""Database connection module."""

import os

from peewee import SqliteDatabase

# Get database path from environment or use default
DATABASE_PATH = os.environ.get("DATABASE_PATH", "app.db")

# Initialize database instance
db = SqliteDatabase(DATABASE_PATH)


def create_tables() -> None:
    """Create all database tables if they don't exist."""
    from app.models.collection import Collection
    from app.models.mod import Mod
    from app.models.mod_collection_entry import ModCollectionEntry
    from app.models.mod_image import ModImage
    from app.models.server_config import ServerConfig

    with db:
        db.create_tables(
            [Mod, Collection, ModCollectionEntry, ModImage, ServerConfig], safe=True
        )


__all__ = ["db", "create_tables"]
