from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .. import db

if TYPE_CHECKING:
    from .schedule import Schedule


class TaskLogEntry(db.Model):  # type: ignore[name-defined]
    """Task Log Entry

    Outputted by scheduled tasked executing

    Attributes:
        id: Primary key identifier
        schedule_id: ID of the schedule this event occurred within
        message: the actual log message
        message_level: the log level of the message
        received_at: the datetime the event was received
    """

    __tablename__ = "task_log_entry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    schedule_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("schedule.id", ondelete="CASCADE"),
        nullable=True,
    )
    message: Mapped[str] = mapped_column(String(255), nullable=False)
    message_level: Mapped[str] = mapped_column(String(255), nullable=False)
    received_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    # Relationships
    schedule: Mapped["Schedule"] = relationship(
        "Schedule",
        back_populates="task_log_entry",
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert TaskLogEntry instance to dictionary representation.

        Returns:
            Dictionary containing task log entry
        """
        result = {
            "id": self.id,
            "schedule_id": self.schedule_id,
            "message": self.message,
            "message_level": self.message_level,
            "received_at": self.received_at.isoformat(),
        }

        return result

    def __repr__(self) -> str:
        """String representation of TaskLogEntry instance."""
        return f"<TaskLogEntry {self.msg}>"
