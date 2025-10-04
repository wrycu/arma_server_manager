"""Background task definitions using Celery."""

import os
import shutil
import subprocess
import time
from datetime import datetime
from typing import Any

from celery import shared_task
from flask import current_app
from sqlalchemy.sql import and_

from app import db
from app.models.mod import Mod
from app.models.schedule import Schedule
from app.models.server_config import ServerConfig
from app.utils.helpers import Arma3ServerHelper, SteamAPI, TaskHelper


@shared_task
def download_arma3_mod(mod_id: int) -> dict[str, Any]:
    """
    Downloads a subscribed, NOT ALREADY DOWNLOADED Arma 3 mod
    :param mod_id: - INT, the subscribed mod ID to download
    :return: DICT representing the download outcome
    {
        "status": "<overall_outcome>",
        "message": "<more_detailed_outcome>",
        "meta": {
            "mod_id": "<ID_of_mod_this_applies_to",
        },
    }
    """
    current_app.logger.info(f"Starting arma 3 mod download ({mod_id})")
    mod_data = Mod.query.get(mod_id)
    if not mod_data:
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} not found",
            "meta": {
                "mod_id": mod_id,
            },
        }
    if mod_data.local_path:
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} already downloaded, try deleting first!",
            "meta": {
                "mod_id": mod_id,
            },
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
    current_app.logger.info(f"Done downloading {mod_id}")
    return result


@shared_task
def update_arma3_mod(mod_id: int) -> dict[str, Any]:
    """
    Updates a single Arma 3 mod. Note that this is here as an async task; it should not be scheduled
    Instead, `mod_update` should be used within a schedule (which invokes this task)
    :param mod_id:
        INT - the subscribed mod ID to update
    :return:
        DICT representing the result
        {
            "status": "<update_status>",
            "message": "<more_verbose_status_info>",
            "meta": {
                "mod_id": "<ID_of_the_mod_this_applies_to>",
            }
        }
    """
    current_app.logger.info(f"Starting arma 3 mod update ({mod_id})")
    mod_data = Mod.query.get(mod_id)
    if not mod_data:
        current_app.logger.info("Mod not found")
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} not found",
            "meta": {
                "mod_id": mod_id,
            },
        }
    if not mod_data.local_path:
        current_app.logger.info("Mod not installed")
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} not downloaded, try downloading first!",
            "meta": {
                "mod_id": mod_id,
            },
        }

    # build the destination path
    mod_dir = os.path.join(
        current_app.config["MOD_MANAGERS"]["ARMA3"].dst_dir,
        f"{mod_data.filename}",
    )
    if mod_data.mod_type == "mission":
        mod_dir = os.path.join(
            current_app.config["MOD_MANAGERS"]["ARMA3"].mission_dir,
            f"{mod_data.filename}",
        )

    # trigger the actual update
    current_app.config["MOD_MANAGERS"]["ARMA3"].download_single_mod(
        mod_data.steam_id,
        mod_dir,
    )

    # update the DB to reflect this
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
    current_app.logger.info(f"Done updating {mod_id}")
    return result


@shared_task()
def remove_arma3_mod(mod_id: int) -> dict[str, Any]:
    """
    Uninstalls an installed, subscribed mod
    :param mod_id: - INT, the subscribed mod ID to uninstall
    :return: DICT representing the uninstall outcome
    {
        "status": "<overall_outcome>",
        "message": "<more_detailed_outcome>",
        "meta": {
            "mod_id": "<ID_of_mod_this_applies_to",
        },
    }
    """
    current_app.logger.info(f"Starting arma 3 mod removal ({mod_id})")
    mod_data = Mod.query.get(mod_id)
    if not mod_data:
        current_app.logger.warning(f"Mod {mod_id} not found")
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} not found",
            "meta": {
                "mod_id": mod_id,
            },
        }
    if not mod_data.local_path:
        current_app.logger.warning(f"Mod {mod_id} not downloaded")
        return {
            "status": "aborted",
            "message": f"Mod {mod_id} not downloaded, why are you even deleting it?!",
            "meta": {
                "mod_id": mod_id,
            },
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
    current_app.logger.info("Done removing")
    return result


@shared_task()
def server_restart(schedule_id: int = 0) -> None:
    current_app.logger.info("Started restarting server")
    helper = TaskHelper()
    server_stop(schedule_id)
    server_start(schedule_id)
    current_app.logger.info("Server restarted successfully!")
    helper.log_scheduled_task_outcome(schedule_id, "Server restarted successfully!")


@shared_task()
def server_start(schedule_id: int = 0) -> None:
    current_app.logger.info("Started starting server")
    helper = TaskHelper()
    entry = ServerConfig.query.filter(ServerConfig.id == 1).first()
    if not entry:
        current_app.logger.warning(
            "Unable to start server: no server is set to active!"
        )
        helper.log_scheduled_task_outcome(
            schedule_id, "Aborted: no server is set to active"
        )
        return
    server_details = entry.to_dict(include_sensitive=True)
    command = [
        server_details["server_binary"],
    ]
    if server_details["additional_params"]:
        command.append(server_details["additional_params"])
    if server_details["server_name"]:
        command.append(f"-name={server_details['server_name']}")
    else:
        command.append("-name=arma_server_manager_managed_server")
    if server_details["server_config_file"]:
        command.append(f"-config={server_details['server_config_file']}")
    if server_details["mission_file"]:
        command.append(f"-mission={server_details['mission_file']}")
    try:
        for mod in sorted(
            server_details["collection"]["mods"], key=lambda x: x["load_order"]
        ):
            if mod["mod"]["server_mod"]:
                command.append(f"-serverMod={mod['mod']['filename']}")
            else:
                command.append(f"-mod={mod['mod']['filename']}")
    except KeyError:
        # mods do not *have* to be defined...
        pass
    current_app.logger.debug(f"running start server command {command}")
    try:
        proc = subprocess.Popen(
            command, cwd=os.path.dirname(server_details["server_binary"])
        )
        time.sleep(10)
        return_code = proc.poll()
        if return_code:
            try:
                helper.log_scheduled_task_outcome(
                    schedule_id, f"Server failed to start with exit code {return_code}"
                )
            except Exception as e2:
                current_app.logger.error(e2)
            current_app.logger.info(
                f"Server failed to start with exit code {return_code}"
            )
            helper.send_webhooks(
                "server_start", f"Server failed to start with exit code {return_code}"
            )
            return
    except Exception as e:
        try:
            helper.log_scheduled_task_outcome(
                schedule_id, f"Server failed to start: {str(e)}"
            )
        except Exception as e2:
            current_app.logger.error(e2)
        helper.send_webhooks("server_start", f"Server failed to start: {str(e)}")
        return
    current_app.logger.info("Server started successfully!")
    try:
        helper.log_scheduled_task_outcome(schedule_id, "Server started successfully!")
    except Exception as e:
        current_app.logger.error(e)
    helper.send_webhooks("server_start", "successfully started server")


@shared_task()
def server_stop(schedule_id: int = 0) -> None:
    current_app.logger.info("Started stopping server")
    helper = TaskHelper()
    server_helper = Arma3ServerHelper()
    stopped = server_helper.stop_server()
    if stopped:
        current_app.logger.info("Server stopped successfully!")
        try:
            helper.log_scheduled_task_outcome(
                schedule_id, "Server stopped successfully!"
            )
        except Exception as e:
            current_app.logger.error(e)
        helper.send_webhooks("server_stop", "successfully stopped server")
    else:
        current_app.logger.info(
            "Server failed to stop! (permissions issue? not running?)"
        )
        helper.log_scheduled_task_outcome(
            schedule_id, "Server failed to stop! (permissions issue? not running?)"
        )
        helper.send_webhooks(
            "server_stop", "Server failed to stop! (permissions issue? not running?)"
        )


@shared_task()
def mod_update(schedule_id: int = 0) -> None:
    """
    Updates installed and subscribed mods
    Stops the server, if it's running (restarting it after the mods finish updating)
    """
    current_app.logger.info("Updating mods!")
    helper = TaskHelper()
    server_helper = Arma3ServerHelper()
    server_running = server_helper.is_server_running()

    if server_running:
        current_app.logger.info("stopping the running server for mod updates")
        server_stop()

    mods = Mod.query.filter(
        Mod.should_update,
        Mod.steam_last_updated > Mod.last_updated,
    ).all()
    if not mods:
        current_app.logger.info(
            "aborted due to lack of mods (mods already up-to-date?)"
        )
        helper.log_scheduled_task_outcome(
            schedule_id, "aborted due to lack of mods (mods already up-to-date?)"
        )
        return
    for mod in mods:
        mod_status = update_arma3_mod(mod.id)
        current_app.logger.debug(
            f"Mod update for {mod.name} returned the following result: {mod_status['status']}"
        )
        helper.log_scheduled_task_outcome(schedule_id, mod_status["status"])
    if server_running:
        current_app.logger.info("starting the server after mod updates")
        server_start()
    helper.send_webhooks("mod_update", "successfully updated mods")


@shared_task()
def update_mod_steam_updated_time() -> None:
    """
    Checks every mod we have a subscription for and updates their steam last updated time
        This information is used to determine if a newer version of the mod is available
    :return:
        N/A
    """
    current_app.logger.debug("Updating mod steam updated time for all subscribed mods")
    steam_helper = SteamAPI()
    mods = Mod.query.filter(Mod.should_update).all()
    for mod in mods:
        mod_details = steam_helper.get_mod_details(mod.steam_id)
        mod.steam_last_updated = datetime.utcfromtimestamp(mod_details["time_updated"])
    db.session.commit()
    current_app.logger.debug("Done Updating mod steam updated time")


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
    current_app.logger.info(f"Kicking off scheduled tasks for {celery_name}")
    task_map = {
        "server_restart": server_restart,
        "server_start": server_start,
        "server_stop": server_stop,
        "mod_update": mod_update,
    }
    tasks = Schedule.query.filter(
        and_(Schedule.celery_name == celery_name, Schedule.enabled)
    ).all()
    for task in tasks:
        task_obj = task.to_dict()
        task_map[task_obj["action"]].delay(task_obj["id"])
