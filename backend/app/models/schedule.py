"""Automatic Action Scheduler"""

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .. import db

if TYPE_CHECKING:
    from .task_log import TaskLogEntry


class ScheduleAction(enum.Enum):
    """Enumeration for actions which the schedule can take."""

    server_start = "server_start"
    server_stop = "server_stop"
    server_restart = "server_restart"
    mod_update = "mod_update"


class ScheduleName(enum.Enum):
    """Enumeration for available Celery schedules."""

    every_10_seconds = "every_10_seconds"  # for testing
    every_hour = "every_hour"
    every_day = "every_day"
    every_sunday = "every_sunday"
    every_month = "every_month"


class Schedule(db.Model):  # type: ignore[name-defined]
    """Schedule for automatic actions for Arma 3 servers

    Attributes:
        id: Primary key identifier of the schedule
        name: Name of the schedule
        celery_name: Name of the celery schedule (enum, "every_hour", "every_month", "every_sunday", "every_day")
        action: The name of the task to run when this schedule is polled (enum, "server_restart", "server_start", "server_stop", "mod_update")
        enabled: Whether the schedule is enabled
        last_outcome: Result of the last execution
        last_run: The datetime of the last execution
        created_at: When the schedule was created
        updated_at: When the schedule was updated
    """

    __tablename__ = "schedule"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    celery_name: Mapped[ScheduleName] = mapped_column(
        Enum(ScheduleName), default=ScheduleName.every_day, nullable=False
    )
    action: Mapped[ScheduleAction] = mapped_column(
        Enum(ScheduleAction), default=ScheduleAction.mod_update, nullable=False
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_outcome: Mapped[str] = mapped_column(String(255), nullable=True)
    last_run: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    # Relationships
    task_log_entry: Mapped[list["TaskLogEntry"]] = relationship(
        "TaskLogEntry",
        back_populates="schedule",
        cascade="all, delete-orphan",
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert schedule instance to dictionary representation.

        Returns:
            Dictionary containing schedule data
        """
        result = {
            "id": self.id,
            "name": self.name,
            "celery_name": self.celery_name.name,
            "action": self.action.name,
            "enabled": self.enabled if self.enabled else False,
            "last_outcome": self.last_outcome if self.last_outcome else None,
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if self.task_log_entry:
            result["log_entries"] = [entry.to_dict() for entry in self.task_log_entry]

        return result

    def __repr__(self) -> str:
        """String representation of Schedule instance."""
        return f"<Schedule {self.name} ({self.action})>"
