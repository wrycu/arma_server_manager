"""Collection model for managing groups of mods."""

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .. import db

if TYPE_CHECKING:
    from .mod_collection_entry import ModCollectionEntry


class Collection(db.Model):  # type: ignore[name-defined]
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

    __tablename__ = "collections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    mod_entries: Mapped[list["ModCollectionEntry"]] = relationship(
        "ModCollectionEntry", back_populates="collection", cascade="all, delete-orphan"
    )

    def to_dict(self, include_mods: bool = False) -> dict[str, Any]:
        """Convert collection instance to dictionary representation.

        Args:
            include_mods: Whether to include the mods in the collection

        Returns:
            Dictionary containing collection data
        """
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "mod_count": len(self.mod_entries),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

        if include_mods:
            result["mods"] = [entry.to_dict() for entry in self.mod_entries]

        return result

    def __repr__(self) -> str:
        """String representation of Collection instance."""
        return f"<Collection {self.name} ({len(self.mod_entries)} mods)>"
