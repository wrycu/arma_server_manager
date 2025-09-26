"""Flask application configuration classes."""

import os

from app.utils.helpers import Arma3ModManager, Arma3ServerHelper, ScheduleHelper


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

    # SteamCMD settings
    STEAMCMD = {
        "STEAMCMD_PATH": os.environ.get("STEAMCMD_PATH") or "steamcmd",
        "STEAMCMD_USER": os.environ.get("STEAMCMD_USER") or "anonymous",
        "MOD_STAGING_DIR": os.environ.get("MOD_STAGING_DIR")
        or os.path.join(os.getcwd(), "temp", "mod_staging"),
        "MOD_INSTALL_DIR": os.environ.get("MOD_INSTALL_DIR")
        or os.path.join(os.getcwd(), "temp", "mods"),
        "MOD_BACKUP_DIR": os.environ.get("MOD_BACKUP_DIR")
        or os.path.join(os.getcwd(), "temp", "backups"),
    }

    # Classes to actually subscribe, download, etc. mods
    MOD_MANAGERS = {
        "ARMA3": Arma3ModManager(
            STEAMCMD["STEAMCMD_PATH"],
            STEAMCMD["STEAMCMD_USER"],
            STEAMCMD["MOD_STAGING_DIR"],
            STEAMCMD["MOD_INSTALL_DIR"],
        ),
    }
    SCHEDULE_HELPER = ScheduleHelper()
    A3_SERVER_HELPER = Arma3ServerHelper()


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
