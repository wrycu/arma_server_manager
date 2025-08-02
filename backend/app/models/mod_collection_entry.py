"""Mod collection entry model for many-to-many relationship between mods and collections."""

from datetime import datetime
from typing import Any

from peewee import (
    DateTimeField,
    DeferredForeignKey,
    IntegerField,
    Model,
    TextField,
)

from ..database import db


class ModCollectionEntry(Model):
    """Entry model for mods within collections.

    This model represents the many-to-many relationship between
    mods and collections, with additional metadata.

    Attributes:
        id: Primary key identifier
        collection_id: Foreign key to collection
        mod_id: Foreign key to mod
        arguments: Collection-specific arguments for this mod
        added_at: When mod was added to collection
    """

    id = IntegerField(primary_key=True)
    collection = DeferredForeignKey(
        "Collection", backref="mod_entries", on_delete="CASCADE", index=True
    )
    mod = DeferredForeignKey(
        "Mod", backref="collection_entries", on_delete="CASCADE", index=True
    )
    arguments = TextField(null=True)
    added_at = DateTimeField(default=datetime.now)

    class Meta:
        database = db
        table_name = "mod_collection_entries"

    @property
    def collection_id(self) -> int:
        """Get collection ID for backward compatibility."""
        return self.collection.id if self.collection else 0

    @property
    def mod_id(self) -> int:
        """Get mod ID for backward compatibility."""
        return self.mod.id if self.mod else 0

    def to_dict(self, include_mod_details: bool = True) -> dict[str, Any]:
        """Convert mod collection entry to dictionary representation.

        Args:
            include_mod_details: Whether to include full mod details

        Returns:
            Dictionary containing entry data
        """
        result = {
            "id": self.id,
            "collection_id": self.collection_id,
            "mod_id": self.mod_id,
            "arguments": self.arguments,
            "added_at": self.added_at.isoformat() if self.added_at else None,
        }

        if include_mod_details and self.mod:
            result["mod"] = self.mod.to_dict()

        return result

    def __repr__(self) -> str:
        """String representation of ModCollectionEntry instance."""
        return f"<ModCollectionEntry collection={self.collection_id} mod={self.mod_id}>"
