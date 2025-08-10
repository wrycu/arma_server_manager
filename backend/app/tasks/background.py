"""Background task definitions using Celery."""

import os
import shutil
from datetime import datetime
from typing import Any

from celery import shared_task
from flask import current_app
from sqlalchemy.sql import and_

from app import db
from app.models.mod import Mod
from app.models.schedule import Schedule


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

@shared_task()
def server_restart() -> None:
    print("'restarting' server")
    return "Done!"

@shared_task()
def server_start() -> None:
    print("'starting' server")
    return "Done!"

@shared_task()
def server_stop() -> None:
    print("'stopping' server")
    return "Done!"

@shared_task()
def mod_update() -> None:
    print("'updating' mods")
    return "Done!"

@shared_task()
def task_kickoff(celery_name) -> None:
    """
    This job is scheduled to run at various frequencies.
        It queries the DB to find user-defined actions and launches them.
        Used because dynamic, custom schedules did not work here
    :param celery_name:
        Name of the celery schedule, e.g. every_hour
    :return:
        N/A
    """
    task_map = {
        "server_restart": server_restart,
        "server_start": server_start,
        "server_stop": server_stop,
        "mod_update": mod_update,
    }
    tasks = Schedule.query.filter(and_(Schedule.celery_name == celery_name, Schedule.enabled)).all()
    print(f"found {len(tasks)} tasks...")
    for task in tasks:
        task_map[task.to_dict()['action']].delay()
