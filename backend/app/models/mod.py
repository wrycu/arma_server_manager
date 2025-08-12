"""Mod model for Arma 3 mod management."""

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .. import db

if TYPE_CHECKING:
    from .mod_collection_entry import ModCollectionEntry
    from .mod_image import ModImage


class ModType(enum.Enum):
    """Enumeration for mod types."""

    mod = "mod"
    mission = "mission"
    map = "map"


class Mod(db.Model):  # type: ignore[name-defined]
    """Mod model for Arma 3 mod management.

    This model represents an Arma 3 mod or map with metadata
    and management capabilities.

    Attributes:
        id: Primary key identifier
        steam_id: Steam Workshop ID
        filename: Desired naming scheme for the specific mod.
            If not provided, an "@" is added to the steam-defined "title"
            e.g., "CBA_A3" becomes "@CBA_A3"
        name: Display name of the mod
        mod_type: Type of mod (mod, mission, map)
        local_path: Local file system path, e.g. /home/user/server/arma3/addons/@CBA_A3
        arguments: Command line arguments for server
        server_mod: Whether this is a server-side only mod
        size_bytes: Size of mod in bytes
        last_updated: When mod was last updated locally
        steam_last_updated: When mod was last updated on Steam
        :should_update: If this mod should be kept up-to-date when update operations are run
    """

    __tablename__ = "mods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    steam_id: Mapped[int | None] = mapped_column(Integer, unique=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    mod_type: Mapped[ModType] = mapped_column(
        Enum(ModType), default=ModType.mod, nullable=False
    )
    local_path: Mapped[str | None] = mapped_column(String(500))
    arguments: Mapped[str | None] = mapped_column(Text)
    server_mod: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    size_bytes: Mapped[int | None] = mapped_column(Integer)
    last_updated: Mapped[datetime | None] = mapped_column(DateTime)
    steam_last_updated: Mapped[datetime | None] = mapped_column(DateTime)
    should_update: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
            "should_update": self.should_update,
        }

    def __repr__(self) -> str:
        """String representation of Mod instance."""
        return f"<Mod {self.name} ({self.steam_id})>"
