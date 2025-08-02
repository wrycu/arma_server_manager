"""Collection model for managing groups of mods."""

from datetime import datetime
from typing import Any

from peewee import (
    CharField,
    DateTimeField,
    IntegerField,
    Model,
    TextField,
)

from ..database import db


class Collection(Model):
    """Collection model for grouping mods together.

    This model represents a user-defined collection of mods
    that can be used for server configurations or organization.

    Attributes:
        id: Primary key identifier
        name: Display name of the collection
        description: Optional description of the collection
        created_at: When collection was created
        updated_at: When collection was last modified
    """

    id = IntegerField(primary_key=True)
    name = CharField(max_length=255, index=True)
    description = TextField(null=True)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = db
        table_name = "collections"

    def save(self, *args, **kwargs):
        """Override save to update the updated_at field."""
        self.updated_at = datetime.now()
        return super().save(*args, **kwargs)

    def to_dict(self, include_mods: bool = False) -> dict[str, Any]:
        """Convert collection instance to dictionary representation.

        Args:
            include_mods: Whether to include the mods in the collection

        Returns:
            Dictionary containing collection data
        """
        from .mod_collection_entry import ModCollectionEntry

        mod_entries = ModCollectionEntry.select().where(
            ModCollectionEntry.collection == self
        )

        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "mod_count": mod_entries.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_mods:
            result["mods"] = [entry.to_dict() for entry in mod_entries]

        return result

    def __repr__(self) -> str:
        """String representation of Collection instance."""
        from .mod_collection_entry import ModCollectionEntry

        mod_count = (
            ModCollectionEntry.select()
            .where(ModCollectionEntry.collection == self)
            .count()
        )
        return f"<Collection {self.name} ({mod_count} mods)>"
