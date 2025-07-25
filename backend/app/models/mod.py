"""Mod model for Arma 3 mod management."""

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .. import db

if TYPE_CHECKING:
    from .mod_collection_entry import ModCollectionEntry
    from .mod_image import ModImage


class ModType(enum.Enum):
    """Enumeration for mod types."""

    MOD = "mod"
    MISSION = "mission"
    MAP = "map"


class Mod(db.Model):  # type: ignore[name-defined]
    """Mod model for Arma 3 mod management.

    This model represents an Arma 3 mod or map with metadata
    and management capabilities.

    Attributes:
        id: Primary key identifier
        steam_id: Steam Workshop ID
        filename: Local filename of the mod
        name: Display name of the mod
        version: Version string of the mod
        mod_type: Type of mod (mod, mission, map)
        local_path: Local file system path
        arguments: Command line arguments for server
        server_mod: Whether this is a server-side only mod
        size_bytes: Size of mod in bytes
        last_updated: When mod was last updated locally
        steam_last_updated: When mod was last updated on Steam
        created_at: When record was created
        updated_at: When record was last modified
    """

    __tablename__ = "mods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    steam_id: Mapped[int | None] = mapped_column(Integer, unique=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    version: Mapped[str | None] = mapped_column(String(50))
    mod_type: Mapped[ModType] = mapped_column(
        Enum(ModType), default=ModType.MOD, nullable=False
    )
    local_path: Mapped[str | None] = mapped_column(String(500))
    arguments: Mapped[str | None] = mapped_column(Text)
    server_mod: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    size_bytes: Mapped[int | None] = mapped_column(Integer)
    last_updated: Mapped[datetime | None] = mapped_column(DateTime)
    steam_last_updated: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    images: Mapped[list["ModImage"]] = relationship(
        "ModImage", back_populates="mod", cascade="all, delete-orphan"
    )
    collection_entries: Mapped[list["ModCollectionEntry"]] = relationship(
        "ModCollectionEntry", back_populates="mod", cascade="all, delete-orphan"
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert mod instance to dictionary representation.

        Returns:
            Dictionary containing mod data
        """
        return {
            "id": self.id,
            "steam_id": self.steam_id,
            "filename": self.filename,
            "name": self.name,
            "version": self.version,
            "mod_type": self.mod_type.value if self.mod_type else None,
            "local_path": self.local_path,
            "arguments": self.arguments,
            "server_mod": self.server_mod,
            "size_bytes": self.size_bytes,
            "last_updated": (
                self.last_updated.isoformat() if self.last_updated else None
            ),
            "steam_last_updated": (
                self.steam_last_updated.isoformat() if self.steam_last_updated else None
            ),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def __repr__(self) -> str:
        """String representation of Mod instance."""
        return f"<Mod {self.name} ({self.steam_id})>"
