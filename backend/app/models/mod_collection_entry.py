"""Mod collection entry model for many-to-many relationship between mods and collections."""

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .. import db

if TYPE_CHECKING:
    from .collection import Collection
    from .mod import Mod


class ModCollectionEntry(db.Model):  # type: ignore[name-defined]
    """Entry model for mods within collections.

    This model represents the many-to-many relationship between
    mods and collections, with additional metadata.

    Attributes:
        id: Primary key identifier
        collection_id: Foreign key to collection
        mod_id: Foreign key to mod
        added_at: When mod was added to collection
    """

    __tablename__ = "mod_collection_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    collection_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("collections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    mod_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("mods.id", ondelete="CASCADE"), nullable=False, index=True
    )
    added_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    # Relationships
    collection: Mapped["Collection"] = relationship(
        "Collection", back_populates="mod_entries"
    )
    mod: Mapped["Mod"] = relationship("Mod", back_populates="collection_entries")

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
            "added_at": self.added_at.isoformat(),
        }

        if include_mod_details and self.mod:
            result["mod"] = self.mod.to_dict()

        return result

    def __repr__(self) -> str:
        """String representation of ModCollectionEntry instance."""
        return f"<ModCollectionEntry collection={self.collection_id} mod={self.mod_id}>"
