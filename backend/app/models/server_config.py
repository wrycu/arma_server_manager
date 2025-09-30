"""Server configuration model for Arma 3 server settings."""

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .. import db


class ServerConfig(db.Model):  # type: ignore[name-defined]
    """Server configuration model for Arma 3 server settings.

    This model stores server configuration profiles that can be
    used to start Arma 3 servers with specific settings.

    Attributes:
        id: Primary key identifier
        name: Display name of the configuration
        description: Optional description of the configuration
        server_name: In-game server name
        password: Server password (optional)
        admin_password: Admin password for server management
        max_players: Maximum number of players
        mission_file: Path to mission file
        server_config_file: Path to server.cfg file
        basic_config_file: Path to basic.cfg file
        collection_id: The currently active collection (used to determine mods to start with the server)
        additional_params: Additional command line parameters
        # TODO: this can have bad effects if anyone can change it...
        server_binary: Path to server binary
        is_active: Whether this configuration is currently active
        created_at: When configuration was created
        updated_at: When configuration was last modified
    """

    __tablename__ = "server_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    server_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password: Mapped[str | None] = mapped_column(String(255))
    admin_password: Mapped[str] = mapped_column(String(255), nullable=False)
    max_players: Mapped[int] = mapped_column(Integer, default=32, nullable=False)
    mission_file: Mapped[str | None] = mapped_column(String(500))
    server_config_file: Mapped[str | None] = mapped_column(String(500))
    basic_config_file: Mapped[str | None] = mapped_column(String(500))
    collection_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("collections.id", ondelete="CASCADE"),
        nullable=True,
    )
    additional_params: Mapped[str | None] = mapped_column(Text)
    server_binary: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    collection: Mapped[object] = relationship(
        "Collection", back_populates="server_config"
    )

    def to_dict(self, include_sensitive: bool = False) -> dict[str, Any]:
        """Convert server config instance to dictionary representation.

        Args:
            include_sensitive: Whether to include sensitive data like passwords

        Returns:
            Dictionary containing server config data
        """
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "server_name": self.server_name,
            "max_players": self.max_players,
            "mission_file": self.mission_file,
            "server_config_file": self.server_config_file,
            "basic_config_file": self.basic_config_file,
            "collection_id": self.collection_id,
            "collection": {},
            "additional_params": self.additional_params,
            "server_binary": self.server_binary,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        if self.collection:
            result["collection"] = self.collection.to_dict()

        if include_sensitive:
            result.update(
                {
                    "password": self.password,
                    "admin_password": self.admin_password,
                }
            )

        return result

    def __repr__(self) -> str:
        """String representation of ServerConfig instance."""
        return (
            f"<ServerConfig {self.name} ({'active' if self.is_active else 'inactive'})>"
        )
