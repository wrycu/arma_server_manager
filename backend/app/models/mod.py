"""Mod model for Arma 3 mod management."""

import enum
from typing import Any

from peewee import (
    BooleanField,
    CharField,
    DateTimeField,
    IntegerField,
    Model,
    TextField,
)

from ..database import db


class ModType(enum.Enum):
    """Enumeration for mod types."""

    mod = "mod"
    mission = "mission"
    map = "map"


class Mod(Model):
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
    """

    id = IntegerField(primary_key=True)
    steam_id = IntegerField(unique=True, index=True, null=True)
    filename = CharField(max_length=255)
    name = CharField(max_length=255, index=True)
    mod_type = CharField(max_length=20, default="mod")
    local_path = CharField(max_length=500, null=True)
    arguments = TextField(null=True)
    server_mod = BooleanField(default=False)
    size_bytes = IntegerField(null=True)
    last_updated = DateTimeField(null=True)
    steam_last_updated = DateTimeField(null=True)

    class Meta:
        database = db
        table_name = "mods"

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
            "mod_type": self.mod_type,
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
        }

    def __repr__(self) -> str:
        """String representation of Mod instance."""
        return f"<Mod {self.name} ({self.steam_id})>"
