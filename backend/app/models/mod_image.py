"""Mod image model for storing mod preview images."""

from datetime import datetime
from typing import Any

from peewee import (
    BlobField,
    CharField,
    DateTimeField,
    DeferredForeignKey,
    IntegerField,
    Model,
)

from ..database import db


class ModImage(Model):
    """Model for storing mod preview images.

    This model stores image data (as blobs) associated with mods
    for display in the web interface.

    Attributes:
        id: Primary key identifier
        mod_id: Foreign key to associated mod
        image_data: Binary image data
        content_type: MIME type of the image
        created_at: When image was stored
    """

    id = IntegerField(primary_key=True)
    mod = DeferredForeignKey("Mod", backref="images", on_delete="CASCADE", index=True)
    image_data = BlobField()
    content_type = CharField(max_length=50)
    created_at = DateTimeField(default=datetime.now)

    class Meta:
        database = db
        table_name = "mod_images"

    @property
    def mod_id(self) -> int:
        """Get mod ID for backward compatibility."""
        return self.mod.id if self.mod else 0

    def to_dict(self, include_data: bool = False) -> dict[str, Any]:
        """Convert mod image instance to dictionary representation.

        Args:
            include_data: Whether to include the binary image data

        Returns:
            Dictionary containing mod image metadata
        """
        result = {
            "id": self.id,
            "mod_id": self.mod_id,
            "content_type": self.content_type,
            "size_bytes": len(self.image_data) if self.image_data else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        if include_data:
            result["image_data"] = self.image_data

        return result
