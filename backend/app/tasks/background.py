"""Background task definitions using Celery."""

import os
import shutil
from datetime import datetime
from typing import Any

from celery import shared_task
from flask import current_app

from app import db
from app.models.mod import Mod


@shared_task
def download_arma3_mod(mod_id: int) -> dict[str, Any]:
    # TODO: this is vulnerable to path traversal, and will even write it wherever the attacker chooses!
    current_app.logger.info("Starting background task with duration")
    mod_data = Mod.query.get(mod_id)
    if not mod_data:
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} not found",
        }
    if mod_data.local_path:
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} already downloaded, try deleting first!",
        }

    mod_dir = os.path.join(
        current_app.config["MOD_MANAGERS"]["ARMA3"].dst_dir,
        f"{mod_data.filename}",
    )
    if mod_data.mod_type == "mission":
        mod_dir = os.path.join(
            current_app.config["MOD_MANAGERS"]["ARMA3"].mission_dir,
            f"{mod_data.filename}",
        )

    current_app.config["MOD_MANAGERS"]["ARMA3"].download_single_mod(
        mod_data.steam_id,
        mod_dir,
    )
    mod_data.local_path = mod_dir
    mod_data.last_updated = datetime.now()
    db.session.commit()

    result = {
        "status": "completed",
        "message": f"Downloaded to {mod_dir}",
        "meta": {
            "mod_id": mod_id,
        },
    }
    current_app.logger.info("Background task completed successfully")
    return result


@shared_task()
def remove_arma3_mod(mod_id: int) -> dict[str, Any]:
    current_app.logger.info("Starting background task")
    mod_data = Mod.query.get(mod_id)
    if not mod_data:
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} not found",
        }
    if not mod_data.local_path:
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} not downloaded, why are you even deleting it?!",
        }

    mod_dir = os.path.join(
        current_app.config["MOD_MANAGERS"]["ARMA3"].dst_dir,
        f"@{mod_data.name}",
    )
    if mod_data.mod_type == "mission":
        mod_dir = os.path.join(
            current_app.config["MOD_MANAGERS"]["ARMA3"].mission_dir,
        )

    shutil.rmtree(mod_dir)
    mod_data.local_path = None
    mod_data.last_updated = datetime.now()
    db.session.commit()

    result = {
        "status": "completed",
        "message": f"Removed from {mod_dir}",
        "meta": {
            "mod_id": mod_id,
        },
    }
    current_app.logger.info("Background task completed successfully")
    return result
