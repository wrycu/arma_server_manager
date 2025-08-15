"""Configuration model for Notifications."""

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from .. import db


class Notification(db.Model):  # type: ignore[name-defined]
    """Mod model for Arma 3 mod management.

    This model represents an Arma 3 mod or map with metadata
    and management capabilities.

    Attributes:
        id: Primary key identifier
        enabled: Whether this notification is currently enabled
        URL: Location of the webhook to send the notification
        send_server: Whether this notification should be sent on server start/stop events
        send_mod_update: Whether this notification should be sent on mod update events
        last_run: Date and time the notification was last run
        created_at: Date and time the notification was created
        updated_at: Date and time the notification was last updated
    """

    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False)
    URL: Mapped[str] = mapped_column(String, nullable=False)
    send_server: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    send_mod_update: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    last_run: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert notification instance to dictionary representation.

        Returns:
            Dictionary containing notification data
        """
        return {
            "id": self.id,
            "enabled": self.enabled,
            "URL": self.URL,
            "send_server": self.send_server,
            "send_mod_update": self.send_mod_update,
            "last_run": (self.last_run.isoformat() if self.last_run else None),
            "created_at": (self.created_at.isoformat() if self.created_at else None),
            "updated_at": (self.updated_at.isoformat() if self.updated_at else None),
        }

    def __repr__(self) -> str:
        """String representation of Notification instance."""
        return f"<Notification {self.name}>"
