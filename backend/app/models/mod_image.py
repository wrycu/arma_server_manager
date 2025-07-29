"""Mod image model for storing mod preview images."""

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .. import db

if TYPE_CHECKING:
    from .mod import Mod


class ModImage(db.Model):  # type: ignore[name-defined]
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

    __tablename__ = "mod_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mod_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("mods.id", ondelete="CASCADE"), nullable=False, index=True
    )
    image_data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    # Relationships
    mod: Mapped["Mod"] = relationship("Mod", back_populates="images")

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
            "size_bytes": len(self.image_data),
            "created_at": self.created_at.isoformat(),
        }

        if include_data:
            result["image_data"] = self.image_data

        return result
