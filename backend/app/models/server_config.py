"""Server configuration model for Arma 3 server settings."""

from datetime import datetime
from typing import Any

from peewee import (
    BooleanField,
    CharField,
    DateTimeField,
    IntegerField,
    Model,
    TextField,
)

from ..database import db


class ServerConfig(Model):
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
        server_mods: Comma-separated list of server mod IDs
        client_mods: Comma-separated list of client mod IDs
        additional_params: Additional command line parameters
        auto_restart: Whether server should auto-restart
        restart_interval_hours: Hours between automatic restarts
        is_active: Whether this configuration is currently active
        created_at: When configuration was created
        updated_at: When configuration was last modified
    """

    id = IntegerField(primary_key=True)
    name = CharField(max_length=255, index=True)
    description = TextField(null=True)
    server_name = CharField(max_length=255)
    password = CharField(max_length=255, null=True)
    admin_password = CharField(max_length=255)
    max_players = IntegerField(default=32)
    mission_file = CharField(max_length=500, null=True)
    server_config_file = CharField(max_length=500, null=True)
    basic_config_file = CharField(max_length=500, null=True)
    server_mods = TextField(null=True)
    client_mods = TextField(null=True)
    additional_params = TextField(null=True)
    auto_restart = BooleanField(default=False)
    restart_interval_hours = IntegerField(null=True)
    is_active = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = db
        table_name = "server_configs"

    def save(self, *args, **kwargs):
        """Override save to update the updated_at field."""
        self.updated_at = datetime.now()
        return super().save(*args, **kwargs)

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
            "server_mods": self.server_mods,
            "client_mods": self.client_mods,
            "additional_params": self.additional_params,
            "auto_restart": self.auto_restart,
            "restart_interval_hours": self.restart_interval_hours,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

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
