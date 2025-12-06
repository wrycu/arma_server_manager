"""Flask application configuration classes."""

import os
from typing import Any

from flask import Config as FlaskConfig

from app.utils.helpers import (
    Arma3ModManager,
    Arma3ServerHelper,
    ScheduleHelper,
    SteamAPI,
    TaskHelper,
)


class LazyConfig(FlaskConfig):
    """Custom Flask config that supports lazy-loaded helpers via dictionary access."""

    # Lazy initialization storage (class-level to share across instances)
    _mod_managers = None
    _schedule_helper = None
    _a3_server_helper = None
    _steam_api_helper = None
    _task_helper = None
    _steamcmd_config = None

    def __getitem__(self, key: str) -> Any:
        """Override to support lazy loading of helpers via dictionary access."""
        try:
            return super().__getitem__(key)
        except KeyError:
            value = self._get_lazy_value(key)
            if value is not None:
                self[key] = value
                return value
            raise

    def _get_lazy_value(self, name: str) -> Any:
        """Get a lazy-loaded helper value."""
        if name == "MOD_MANAGERS":
            if LazyConfig._mod_managers is None:
                steamcmd = self._get_steamcmd_config()
                LazyConfig._mod_managers = {
                    "ARMA3": Arma3ModManager(
                        steamcmd["STEAMCMD_PATH"],
                        steamcmd["STEAMCMD_USER"],
                        steamcmd.get("STEAMCMD_PASSWORD", ""),
                        steamcmd["MOD_STAGING_DIR"],
                        steamcmd["MOD_INSTALL_DIR"],
                    ),
                }
            return LazyConfig._mod_managers
        elif name == "SCHEDULE_HELPER":
            if LazyConfig._schedule_helper is None:
                LazyConfig._schedule_helper = ScheduleHelper()
            return LazyConfig._schedule_helper
        elif name == "A3_SERVER_HELPER":
            if LazyConfig._a3_server_helper is None:
                steamcmd = self._get_steamcmd_config()
                LazyConfig._a3_server_helper = Arma3ServerHelper(
                    steamcmd["STEAMCMD_PATH"],
                    steamcmd["STEAMCMD_USER"],
                    steamcmd.get("STEAMCMD_PASSWORD", ""),
                    steamcmd["ARMA3_INSTALL_DIR"],
                )
            return LazyConfig._a3_server_helper
        elif name == "STEAM_API_HELPER":
            if LazyConfig._steam_api_helper is None:
                LazyConfig._steam_api_helper = SteamAPI()
            return LazyConfig._steam_api_helper
        elif name == "TASK_HELPER":
            if LazyConfig._task_helper is None:
                LazyConfig._task_helper = TaskHelper()
            return LazyConfig._task_helper
        elif name == "STEAMCMD":
            return self._get_steamcmd_config()
        return None

    def _get_steamcmd_config(self) -> dict[str, str]:
        """Get SteamCMD configuration from environment variables."""
        if LazyConfig._steamcmd_config is None:
            LazyConfig._steamcmd_config = {
                "STEAMCMD_PATH": os.environ.get("STEAMCMD_PATH") or "steamcmd",
                "STEAMCMD_USER": os.environ.get("STEAMCMD_USER") or "anonymous",
                "STEAMCMD_PASSWORD": os.environ.get("STEAMCMD_PASSWORD", ""),
                "MOD_STAGING_DIR": os.environ.get("MOD_STAGING_DIR")
                or os.path.join(os.getcwd(), "temp", "mod_staging"),
                "MOD_INSTALL_DIR": os.environ.get("MOD_INSTALL_DIR")
                or os.path.join(os.getcwd(), "temp", "mods"),
                "MOD_BACKUP_DIR": os.environ.get("MOD_BACKUP_DIR")
                or os.path.join(os.getcwd(), "temp", "backups"),
                "ARMA3_INSTALL_DIR": os.environ.get("ARMA3_INSTALL_DIR")
                or os.path.join(os.getcwd(), "arma3"),
            }
        return LazyConfig._steamcmd_config


class Config:
    """Base configuration class."""

    # Flask settings
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"

    # Database settings
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URI") or "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Celery settings
    CELERY = {
        "broker_url": os.environ.get("CELERY_BROKER_URL")
        or "sqlalchemy+sqlite:///celery.db",
        "result_backend": os.environ.get("CELERY_RESULT_BACKEND")
        or "db+sqlite:///celery_results.db",
    }

    # CORS settings
    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
    ).split(",")

    # Lazy initialization storage (class-level to share across instances)
    _mod_managers = None
    _schedule_helper = None
    _a3_server_helper = None
    _steam_api_helper = None
    _task_helper = None
    _steamcmd_config = None

    def __getattr__(self, name: str):
        """Lazy initialization of helpers when accessed via Flask config."""
        if name == "MOD_MANAGERS":
            if Config._mod_managers is None:
                steamcmd = self._get_steamcmd_config()
                Config._mod_managers = {
                    "ARMA3": Arma3ModManager(
                        steamcmd["STEAMCMD_PATH"],
                        steamcmd["STEAMCMD_USER"],
                        steamcmd.get("STEAMCMD_PASSWORD", ""),
                        steamcmd["MOD_STAGING_DIR"],
                        steamcmd["MOD_INSTALL_DIR"],
                    ),
                }
            return Config._mod_managers
        elif name == "SCHEDULE_HELPER":
            if Config._schedule_helper is None:
                Config._schedule_helper = ScheduleHelper()
            return Config._schedule_helper
        elif name == "A3_SERVER_HELPER":
            if Config._a3_server_helper is None:
                steamcmd = self._get_steamcmd_config()
                Config._a3_server_helper = Arma3ServerHelper(
                    steamcmd["STEAMCMD_PATH"],
                    steamcmd["STEAMCMD_USER"],
                    steamcmd.get("STEAMCMD_PASSWORD", ""),
                    steamcmd["ARMA3_INSTALL_DIR"],
                )
            return Config._a3_server_helper
        elif name == "STEAM_API_HELPER":
            if Config._steam_api_helper is None:
                Config._steam_api_helper = SteamAPI()
            return Config._steam_api_helper
        elif name == "TASK_HELPER":
            if Config._task_helper is None:
                Config._task_helper = TaskHelper()
            return Config._task_helper
        elif name == "STEAMCMD":
            return self._get_steamcmd_config()
        raise AttributeError(
            f"'{type(self).__name__}' object has no attribute '{name}'"
        )

    def _get_steamcmd_config(self):
        """Get SteamCMD configuration from environment variables."""
        if Config._steamcmd_config is None:
            Config._steamcmd_config = {
                "STEAMCMD_PATH": os.environ.get("STEAMCMD_PATH") or "steamcmd",
                "STEAMCMD_USER": os.environ.get("STEAMCMD_USER") or "anonymous",
                "STEAMCMD_PASSWORD": os.environ.get("STEAMCMD_PASSWORD", ""),
                "MOD_STAGING_DIR": os.environ.get("MOD_STAGING_DIR")
                or os.path.join(os.getcwd(), "temp", "mod_staging"),
                "MOD_INSTALL_DIR": os.environ.get("MOD_INSTALL_DIR")
                or os.path.join(os.getcwd(), "temp", "mods"),
                "MOD_BACKUP_DIR": os.environ.get("MOD_BACKUP_DIR")
                or os.path.join(os.getcwd(), "temp", "backups"),
                "ARMA3_INSTALL_DIR": os.environ.get("ARMA3_INSTALL_DIR")
                or os.path.join(os.getcwd(), "arma3"),
            }
        return Config._steamcmd_config


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("DEV_DATABASE_URI") or "sqlite:///dev.db"

    # Development-specific Celery settings
    CELERY = {
        "broker_url": "sqlalchemy+sqlite:///dev_celery.db",
        "result_backend": "db+sqlite:///dev_celery_results.db",
    }


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    SECRET_KEY = os.environ.get("SECRET_KEY") or "prod-secret-key-change-for-security"


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False

    # Testing-specific Celery settings (use memory for speed)
    CELERY = {
        "broker_url": "sqlalchemy+sqlite:///:memory:",
        "result_backend": "db+sqlite:///:memory:",
    }
