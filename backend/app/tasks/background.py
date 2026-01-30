"""Background task definitions using Celery."""

import os
import shutil
import subprocess
import time
from datetime import datetime

from celery import current_task, shared_task
from flask import current_app
from sqlalchemy.sql import and_

from app import db
from app.models.mod import Mod, ModStatus, ModType
from app.models.schedule import Schedule
from app.models.server_config import ServerConfig


@shared_task
def download_arma3_mod(mod_id: int) -> None:
    """
    Downloads a subscribed, NOT ALREADY DOWNLOADED Arma 3 mod
    :param mod_id:
        INT, the subscribed mod ID to download
    :return:
        N/A, though the result is stored in the task output
    """
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=0,
        task_type="mod_download",
        level="info",
        status="RUNNING",
        msg=f"Starting Arma 3 mod download ({mod_id})",
    )
    mod_data = Mod.query.get(mod_id)
    if not mod_data:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=0,
            task_type="mod_download",
            level="warn",
            status="ABORTED",
            msg=f"Arma 3 mod {mod_id} not found",
        )
        return
    if mod_data.status in [ModStatus.install_requested, ModStatus.installed]:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=0,
            task_type="mod_download",
            level="warn",
            status="ABORTED",
            msg=f"Arma 3 mod {mod_id} already downloaded or download already requested",
        )
        return
    mod_data.status = ModStatus.install_requested
    db.session.commit()

    mod_dir = os.path.join(
        current_app.config["MOD_MANAGERS"]["ARMA3"].dst_dir,
        f"{mod_data.filename}",
    )
    if mod_data.mod_type == ModType.mission:
        mod_dir = os.path.join(
            current_app.config["MOD_MANAGERS"]["ARMA3"].mission_dir,
            f"{mod_data.filename}",
        )

    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].download_single_mod(
            mod_data.steam_id,
            mod_dir,
            mod_data.mod_type == ModType.mission,
        )
        mod_data.local_path = mod_dir
        mod_data.last_updated = datetime.now()
        mod_data.status = ModStatus.installed
    except Exception:
        mod_data.status = ModStatus.install_failed
        db.session.commit()
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=0,
            task_type="mod_download",
            level="error",
            status="FAILURE",
            msg=f"Failed to download Arma 3 mod {mod_id}",
        )
        return
    db.session.commit()

    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=0,
        task_type="mod_download",
        level="info",
        status="SUCCEEDED",
        msg=f"Successfully downloaded Arma 3 mod {mod_id}",
    )


@shared_task
def update_arma3_mod(mod_id: int, schedule_id: int = 0) -> None:
    """
    Updates a single Arma 3 mod. Note that this is here as an async task; it should not be scheduled
    Instead, `mod_update` should be used within a schedule (which invokes this task)
    :param mod_id:
        INT - the subscribed mod ID to update
    :param schedule_id:
    :return:
        N/A, though the result is stored in the task output
    """
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="mod_update",
        level="info",
        status="RUNNING",
        msg=f"Starting Arma 3 mod update ({mod_id})",
    )
    mod_data = Mod.query.get(mod_id)
    if not mod_data:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="mod_update",
            level="warn",
            status="ABORTED",
            msg=f"Arma 3 mod {mod_id} not found",
        )
        return
    if mod_data.status not in [ModStatus.installed]:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="mod_update",
            level="warn",
            status="ABORTED",
            msg=f"Arma 3 mod {mod_id} not installed",
        )
        return
    mod_data.status = ModStatus.update_requested
    db.session.commit()

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

    try:
        # trigger the actual update
        current_app.config["MOD_MANAGERS"]["ARMA3"].download_single_mod(
            mod_data.steam_id,
            mod_dir,
            mod_data.mod_type == ModType.mission,
        )

        # update the DB to reflect this
        mod_data.local_path = mod_dir
        mod_data.last_updated = datetime.now()
        mod_data.status = ModStatus.installed
    except Exception as e:
        mod_data.status = ModStatus.install_failed
        db.session.commit()
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="mod_download",
            level="error",
            status="FAILURE",
            msg=f"Failed to update Arma 3 mod {mod_id}: {str(e)}",
        )
        return
    db.session.commit()

    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="mod_update",
        level="info",
        status="SUCCEEDED",
        msg=f"Successfully updated Arma 3 mod {mod_id}",
    )


@shared_task()
def remove_arma3_mod(mod_id: int) -> None:
    """
    Uninstalls an installed, subscribed mod
    :param mod_id:
        INT, the subscribed mod ID to uninstall
    :return:
        N/A, though the result is stored in the task output
    """
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=0,
        task_type="mod_remove",
        level="info",
        status="RUNNING",
        msg=f"Starting Arma 3 mod uninstall {mod_id}",
    )
    mod_data = Mod.query.get(mod_id)
    if not mod_data:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=0,
            task_type="mod_remove",
            level="warn",
            status="ABORTED",
            msg=f"Arma 3 mod {mod_id} not found",
        )
        return
    if mod_data.status not in [ModStatus.installed, ModStatus.install_failed]:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=0,
            task_type="mod_remove",
            level="warn",
            status="ABORTED",
            msg=f"Arma 3 mod {mod_id} not downloaded, why are you even deleting it?!",
        )
        return
    mod_data.status = ModStatus.uninstall_requested
    db.session.commit()

    try:
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
        mod_data.status = ModStatus.not_installed
    except Exception:
        mod_data.status = ModStatus.uninstall_failed
        db.session.commit()
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=0,
            task_type="mod_remove",
            level="error",
            status="FAILURE",
            msg=f"Starting arma 3 mod download ({mod_id})",
        )
        return
    db.session.commit()

    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=0,
        task_type="mod_remove",
        level="info",
        status="SUCCEEDED",
        msg=f"Uninstalled Arma 3 mod {mod_id}",
    )


@shared_task()
def server_restart(schedule_id: int = 0) -> None:
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="server_restart",
        level="info",
        status="RUNNING",
        msg="Started restarting Arma 3 server",
    )
    server_stop(schedule_id)
    server_start(schedule_id)
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="server_restart",
        level="info",
        status="SUCCEEDED",
        msg="Arma 3 server restarted successfully!",
    )


@shared_task()
def server_start(schedule_id: int = 0) -> None:
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="server_start",
        level="info",
        status="RUNNING",
        msg="Beginning Arma 3 server start...",
    )

    try:
        server_helper = current_app.config["A3_SERVER_HELPER"]
        if server_helper.is_server_running():
            helper.update_task_state(
                current_task=current_task,
                current_app=current_app,
                schedule_id=schedule_id,
                task_type="server_start",
                level="warn",
                status="ABORTED",
                msg="Aborted starting Arma 3 server: server already running",
            )
            return
        command, working_dir = server_helper.build_run_command(headless_client=False)
    except Exception as e:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="server_start",
            level="error",
            status="FAILURE",
            msg=f"Failed to start Arma 3 server: {str(e)}",
        )
        return

    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="server_start",
        level="debug",
        status="RUNNING",
        msg=f"Running Arma 3 start command: {' '.join(command)}",
    )
    try:
        proc = subprocess.Popen(command, cwd=working_dir)
        time.sleep(10)
        return_code = proc.poll()
        if return_code:
            helper.update_task_state(
                current_task=current_task,
                current_app=current_app,
                schedule_id=schedule_id,
                task_type="server_start",
                level="error",
                status="FAILURE",
                msg=f"Arma 3 server failed to start: {str(return_code)}",
            )
            return
    except Exception as e:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="server_start",
            level="error",
            status="RUNNING",
            msg=f"Arma 3 server command failed: {str(e)}",
        )
        return
    entry = ServerConfig.query.first()
    entry.is_active = True
    db.session.commit()
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="server_start",
        level="info",
        status="SUCCEEDED",
        msg="Arma 3 server successfully started",
    )


@shared_task()
def server_stop(schedule_id: int = 0) -> None:
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="",
        level="info",
        status="RUNNING",
        msg="Beginning Arma 3 server stop...",
    )

    server_helper = current_app.config["A3_SERVER_HELPER"]
    stopped = server_helper.stop_server()
    if stopped:
        entry = ServerConfig.query.first()
        entry.is_active = False
        db.session.commit()
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="server_stop",
            level="info",
            status="SUCCEEDED",
            msg="Arma 3 server successfully stopped",
        )
    else:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="server_stop",
            level="error",
            status="FAILURE",
            msg="Arma 3 server failed to stop! (permissions issue? not running?)",
        )


@shared_task()
def server_update(schedule_id: int = 0) -> None:
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="server_update",
        level="info",
        status="RUNNING",
        msg="Beginning Arma 3 server binary update...",
    )

    server_helper = current_app.config["A3_SERVER_HELPER"]

    server_running = server_helper.is_server_running()
    if server_running:
        server_stop()
    command = [
        server_helper.steam_cmd_path,
        f"+force_install_dir {server_helper.server_install_path}",
        f"+login {server_helper.steam_cmd_user}",
        f"+app_update {server_helper.arma3_app_id}",
        "validate",
        "+quit",
    ]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="server_update",
        level="debug",
        status="RUNNING",
        msg=f"Running steamcmd command {' '.join(command)} to update Arma 3 server...",
    )
    subprocess.check_call(
        command,
    )
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="server_update",
        level="debug",
        status="RUNNING",
        msg="Arma 3 command executed, checking if we need to start the server again...",
    )
    if server_running:
        server_start()
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="server_update",
        level="info",
        status="SUCCEEDED",
        msg="Arma 3 server binary successfully updated.",
    )


@shared_task()
def mod_update(schedule_id: int = 0) -> None:
    """
    Updates installed and subscribed mods
    Stops the server, if it's running (restarting it after the mods finish updating)
    """
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="mod_update",
        level="info",
        status="RUNNING",
        msg="Updating installed Arma 3 mods!",
    )
    server_helper = current_app.config["A3_SERVER_HELPER"]
    server_running = server_helper.is_server_running()

    if server_running:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="mod_update",
            level="debug",
            status="RUNNING",
            msg="Stopping Arma 3 server to update mods...",
        )
        server_stop()

    mods = Mod.query.filter(
        Mod.should_update,
        Mod.steam_last_updated > Mod.last_updated,
    ).all()
    if not mods:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="mod_update",
            level="warn",
            status="ABORTED",
            msg="No mods found to update! Aborting",
        )
        return
    for mod in mods:
        update_arma3_mod(mod.id)
    if server_running:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="mod_update",
            level="debug",
            status="RUNNING",
            msg="Starting server after mod updates",
        )
        server_start()
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="mod_update",
        level="info",
        status="SUCCEEDED",
        msg="Successfully updated installed Arma 3 mods!",
    )


@shared_task()
def headless_client_start(schedule_id: int = 0) -> None:
    """
    Starts a headless client and attempts to connect it to localhost
        Optional INT representing the schedule this was invoked under
    :return:
        N/A, but logs the outcome to the schedule
    """
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="hc_start",
        level="info",
        status="RUNNING",
        msg="Starting Arma 3 headless client",
    )

    try:
        server_helper = current_app.config["A3_SERVER_HELPER"]

        if not server_helper.is_server_running():
            helper.update_task_state(
                current_task=current_task,
                current_app=current_app,
                schedule_id=schedule_id,
                task_type="hc_start",
                level="warn",
                status="ABORTED",
                msg="Arma 3 server not running, aborted headless client start",
            )
            return

        if server_helper.is_hc_running():
            helper.update_task_state(
                current_task=current_task,
                current_app=current_app,
                schedule_id=schedule_id,
                task_type="hc_start",
                level="warn",
                status="ABORTED",
                msg="Arma 3 headless client already running, aborted headless client start",
            )
            return

        command, working_dir = server_helper.build_run_command(headless_client=True)
    except Exception as e:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="hc_start",
            level="error",
            status="FAILURE",
            msg=f"Failed starting Arma 3 headless client: {str(e)}",
        )
        return

    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="hc_start",
        level="debug",
        status="RUNNING",
        msg=f"Arma 3 headless client command: {' '.join(command)}",
    )
    try:
        proc = subprocess.Popen(command, cwd=working_dir)
        time.sleep(10)
        return_code = proc.poll()
        if return_code:
            helper.update_task_state(
                current_task=current_task,
                current_app=current_app,
                schedule_id=schedule_id,
                task_type="hc_start",
                level="error",
                status="FAILURE",
                msg=f"Failed to start Arma 3 headless client: {str(return_code)}",
            )
            return
    except Exception as e:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="hc_start",
            level="error",
            status="FAILURE",
            msg=f"Failed to start Arma 3 headless client: {str(e)}",
        )
        return
    entry = ServerConfig.query.first()
    entry.is_active = True
    db.session.commit()
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="hc_start",
        level="info",
        status="SUCCEEDED",
        msg="Arma 3 headless client started successfully",
    )


@shared_task()
def headless_client_stop(schedule_id: int = 0) -> None:
    """
    Stops a running headless client
    :param schedule_id:
        Optional INT representing the schedule this was invoked under
    :return:
        N/A, but logs the outcome to the schedule
    """
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=schedule_id,
        task_type="hc_stop",
        level="info",
        status="RUNNING",
        msg="Starting stopping Arma 3 headless client",
    )

    server_helper = current_app.config["A3_SERVER_HELPER"]
    stopped = server_helper.stop_headless_client()
    if stopped:
        entry = ServerConfig.query.first()
        entry.is_active = False
        db.session.commit()
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="hc_stop",
            level="info",
            status="SUCCEEDED",
            msg="Arma 3 headless client stopped successfully",
        )
    else:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=schedule_id,
            task_type="hc_stop",
            level="error",
            status="FAILURE",
            msg="Arma 3 headless client failed to stop (permissions issue? not running?)",
        )


@shared_task()
def update_mod_steam_updated_time() -> None:
    """
    Checks every mod we have a subscription for and updates their steam last updated time
        This information is used to determine if a newer version of the mod is available
    :return:
        N/A
    """
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=-1,
        task_type="mod_steam_update",
        level="debug",
        status="RUNNING",
        msg="Updating mod steam updated time for all subscribed mods",
    )
    steam_helper = current_app.config["STEAM_API_HELPER"]
    mods = Mod.query.filter(Mod.should_update).all()
    for mod in mods:
        mod_details = steam_helper.get_mod_details(mod.steam_id)
        mod.steam_last_updated = datetime.utcfromtimestamp(mod_details["time_updated"])
    db.session.commit()
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=-1,
        task_type="mod_steam_update",
        level="debug",
        status="SUCCEEDED",
        msg="Done Updating mod steam updated time",
    )


@shared_task()
def check_for_server_death() -> None:
    """
    Checks if the defined run state of the server matches the current run state, notifying if they don't match
    :return:
        N/A
    """
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=-1,
        task_type="server_died",
        level="info",
        status="RUNNING",
        msg="Checking Arma 3 server death",
    )

    try:
        server_helper = current_app.config["A3_SERVER_HELPER"]
        server_saved_state = ServerConfig.query.first()

        if not server_helper.is_server_running() and server_saved_state.is_active:
            helper.update_task_state(
                current_task=current_task,
                current_app=current_app,
                schedule_id=-1,
                task_type="server_died",
                level="warn",
                status="SUCCEEDED",
                msg="Arma 3 server state mismatch: the server died or was killed!",
            )
            server_saved_state.is_active = False
            db.session.commit()
            return
    except Exception as e:
        helper.update_task_state(
            current_task=current_task,
            current_app=current_app,
            schedule_id=-1,
            task_type="server_died",
            level="error",
            status="FAILURE",
            msg=f"Problem checking for Arma 3 server state mismatch: {str(e)}",
        )
        return
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=-1,
        task_type="server_died",
        level="debug",
        status="SUCCEEDED",
        msg="Arma 3 server state is correct, hooray!",
    )


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
    helper = current_app.config["TASK_HELPER"]
    helper.update_task_state(
        current_task=current_task,
        current_app=current_app,
        schedule_id=-1,
        task_type="",
        level="debug",
        status="RUNNING",
        msg=f"Kicking off scheduled tasks for {celery_name}",
    )
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
