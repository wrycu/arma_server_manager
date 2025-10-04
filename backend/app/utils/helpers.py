"""Utility helper functions."""

import os
import shutil
import subprocess
from datetime import datetime
from xmlrpc.client import Binary

import httpx
import psutil
import sqlalchemy

from app import db
from app.models.collection import Collection
from app.models.mod import Mod
from app.models.mod_collection_entry import ModCollectionEntry
from app.models.mod_image import ModImage
from app.models.notification import Notification
from app.models.schedule import Schedule
from app.models.server_config import ServerConfig


# Helper functions will be added here as needed
class Arma3ModManager:
    """
    Manager for all things Arma 3 mods
    Note that "mod_id" refers to the internal ID used by this application, and "steam_mod_id" refers to the steam mod ID
    """

    def __init__(
        self,
        steam_cmd_path: str,
        steam_cmd_user: str,
        mod_staging_dir: str,
        mod_dest_dir: str,
    ) -> None:
        self.steam_cmd_path = steam_cmd_path
        self.steam_cmd_user = steam_cmd_user
        self.arma3_app_id = 107410
        self.staging_dir = mod_staging_dir
        self.dst_dir = mod_dest_dir
        self.mission_dir = os.path.join(mod_dest_dir, "mpmissions")
        self._validate_dirs()
        self._validate_steam_cmd()
        self.steam_api = SteamAPI()

    @staticmethod
    def get_subscribed_mods() -> list[dict[str, str]]:
        """
        Retrieves details about subscribed mods
        """
        results = []
        for result in Mod.query.all():
            details = result.to_dict()
            try:
                ModImage.query.filter(ModImage.id == result.id).first()
                details["image_available"] = True
            except sqlalchemy.orm.exc.NoResultFound:
                details["image_available"] = False
            results.append(details)
        return results

    @staticmethod
    def get_subscribed_mod_details(mod_id: int) -> dict[str, str]:
        """
        Retrieves details about a subscribed mod
        :param mod_id: - INT, the internal ID of the mod to get details for
        :return:
        """
        result = Mod.query.filter(Mod.id == mod_id).first()
        details = result.to_dict()
        try:
            ModImage.query.filter(ModImage.id == result.id).first()
            details["image_available"] = True
        except sqlalchemy.orm.exc.NoResultFound:
            details["image_available"] = False
        return details

    @staticmethod
    def update_subscribed_mod(mod_id: int, updated_data: dict) -> None:
        """
        Updates details about a subscribed mod
        NOTE that most fields are allowed to be updated.
            Any filtering of user input should occur before this function is called.
        :param mod_id: - INT, the internal ID of the mod to get details for
        :param updated_data: - DICT, the updated data to apply to the mod (certain fields are not allowed)
        :return:
        """
        try:
            result = Mod.query.filter(Mod.id == mod_id).first()
            if result:
                disallowed_attrs = [
                    "id",
                    "updated_at",
                    "steam_last_updated",
                ]  # do not allow certain fields to be modified
                for key, value in updated_data.items():
                    if key not in disallowed_attrs:
                        setattr(result, key, value)
                db.session.commit()
        except Exception as e:
            raise Exception(f"Failed to update mod (mod not found?): {str(e)}") from e

    def remove_subscribed_mod(self, mod_id: int) -> None:
        """
        Removes a subscribed mod
        :param mod_id: - INT, the internal ID of the mod to get details for
        :return:
        """
        # TODO: delete the local files
        # TODO: check for presence in mod collections and refuse to remove if present
        try:
            db.session.delete(ModImage.query.filter(ModImage.mod_id == mod_id).first())
            db.session.commit()
        except sqlalchemy.orm.exc.UnmappedInstanceError:
            # preview image is not required, so ignore it being missing
            pass
        try:
            db.session.delete(Mod.query.filter(Mod.id == mod_id).first())
            db.session.commit()
        except sqlalchemy.orm.exc.UnmappedInstanceError as e:
            raise Exception("Cannot find subscribed mod") from e

    def add_subscribed_mod(self, mod_steam_id: int) -> int:
        """
        Adds a subscribed mod, which allows downloading of it
        :param mod_steam_id: - INT, the internal ID of the mod to get details for
        :return:
            The ID of the newly subscribed mod
        """
        mod_details = self.steam_api.get_mod_details(mod_steam_id)

        filename = f"@{mod_details['title']}"
        if mod_details["filename"]:
            filename = mod_details["filename"]
        if filename and os.path.pardir in filename:
            # get the absolute path if it looks like there's an attempt to use a relative path in the name
            filename = os.path.abspath(filename)

        prepared_mod = Mod(
            steam_id=mod_steam_id,
            filename=filename,
            name=mod_details["title"],
            mod_type=mod_details["mod_type"],
            arguments="",
            server_mod=False,
            size_bytes=mod_details["file_size"],
            steam_last_updated=datetime.utcfromtimestamp(mod_details["time_updated"]),
            should_update=True,
        )
        db.session.add(prepared_mod)
        try:
            db.session.commit()
        except sqlalchemy.exc.IntegrityError as e:
            db.session.rollback()
            raise Exception("This mod is already subscribed") from e

        img_data = httpx.get(mod_details["preview_url"])
        preview_image = ModImage(
            mod_id=prepared_mod.id,
            image_data=bytes(img_data.content),
            content_type=img_data.headers.get("content-type"),
        )
        db.session.add(preview_image)
        db.session.commit()
        return prepared_mod.id

    def get_subscribed_mod_image(self, mod_id: int) -> Binary:
        """
        Retrieves preview image for a specific mod
        :param mod_id: - INT, the internal ID of the mod to get details for
        :return:
        """
        return (
            ModImage.query.filter(ModImage.id == mod_id)
            .first()
            .to_dict(include_data=True)
        )

    def download_single_mod(self, mod_id: int, dst_dir: str):
        """
        Downloads a single mod using steamcmd
        :param mod_id: - INT, the internal ID of the mod to get details for
        :param dst_dir: - STR, the destination directory to move the downloaded mod to
        :return:
        """
        subprocess.check_call(
            [
                self.steam_cmd_path,
                f"+force_install_dir {self.staging_dir}",
                # TODO: handle first-time login / cached credential problems
                f"+login {self.steam_cmd_user}",
                f"+workshop_download_item {self.arma3_app_id} {mod_id}",
                "validate",
                "+quit",
            ],
        )
        self._move_single_mod_(mod_id, dst_dir)

    def _move_single_mod_(self, mod_id: int, dst_dir: str):
        """
        Moves a downloaded mod from the staging directory to the destination directory
        :param mod_id: - INT, the internal ID of the mod to get details for
        :param dst_dir: - STR, the destination directory to move the downloaded mod to
        :return:
        """
        self._delete_mod_(dst_dir)
        os.rename(
            os.path.join(
                self.staging_dir,
                "steamapps",
                "workshop",
                "content",
                str(self.arma3_app_id),
                str(mod_id),
            ),
            os.path.join(
                self.dst_dir,
                dst_dir,
            ),
        )
        self._lowercase_mod_(
            os.path.join(
                self.dst_dir,
                dst_dir,
            )
        )

    @staticmethod
    def _lowercase_mod_(dst_dir: str):
        """
        Lowercases all mod files (for use on *nix)
        :param dst_dir: - STR, the directory to lowercase all files and directories within
        :return:
        """

        # https://stackoverflow.com/a/3075668
        def rename_all(root, items):
            for name in items:
                try:
                    os.rename(
                        os.path.join(root, name), os.path.join(root, name.lower())
                    )
                except OSError:
                    pass  # can't rename it, skip

        # starts from the bottom so paths further up remain valid after renaming
        for root, dirs, files in os.walk(dst_dir, topdown=False):
            rename_all(root, dirs)
            rename_all(root, files)

    def _validate_dirs(self):
        """
        Validate that directories exist before attempting to use them, creating them if they don't exist
        :return:
        """
        directories = [self.staging_dir, self.dst_dir, self.mission_dir]

        for directory in directories:
            if not os.path.exists(directory):
                try:
                    os.makedirs(directory, exist_ok=True)
                except OSError as e:
                    raise Exception(
                        f"Failed to create directory {directory}: {e}"
                    ) from e

    def _validate_steam_cmd(self):
        if not os.path.isfile(self.steam_cmd_path):
            raise Exception(
                "SteamCMD is not set properly. Please check the path you have set!"
            )

    @staticmethod
    def _delete_mod_(mod_dir: str):
        if os.path.exists(mod_dir):
            shutil.rmtree(mod_dir)

    @staticmethod
    def get_all_collections():
        """
        Retrieves details about mod collections
        """
        results = []
        for result in Collection.query.all():
            details = result.to_dict()
            results.append(details)
        return results

    @staticmethod
    def get_collection_details(collection_id: int) -> dict[str, str]:
        return Collection.query.filter(Collection.id == collection_id).first()

    def create_collection(self, collection_data: dict[str, str]) -> int:
        collection = Collection(
            name=collection_data["name"],
            description=collection_data["description"],
        )
        db.session.add(collection)
        db.session.commit()

        try:
            for mod in collection_data["mods"]:
                self.add_mod_to_collection(
                    collection.id,
                    int(mod),
                )
            db.session.commit()
        except KeyError:
            # mods are not a required field for creating a collection
            pass

        return collection.id

    def update_collection(
        self, collection_id: int, collection_data: dict[str, str]
    ) -> None:
        try:
            result = Collection.query.filter(Collection.id == collection_id).first()
            if result:
                disallowed_attrs = [
                    "id",
                    "updated_at",
                ]  # do not allow certain fields to be modified
                for key, value in collection_data.items():
                    if key not in disallowed_attrs:
                        setattr(result, key, value)
                try:
                    for mod in collection_data["mods"]:
                        self.add_mod_to_collection(
                            collection_id,
                            int(mod),
                        )
                except KeyError:
                    # "mods" is not a required field for updates
                    pass
                db.session.commit()
            else:
                raise Exception("Collection not found")
        except Exception as e:
            raise Exception("Failed to update collection (mod not found?)") from e

    @staticmethod
    def reorder_mod_load(collection_id: int, mod_id: int, load_order: int) -> None:
        mod = ModCollectionEntry.query.filter(
            ModCollectionEntry.collection_id == collection_id,
            ModCollectionEntry.mod_id == mod_id,
        ).first()
        if not mod:
            raise Exception("Mod not found")
        mod.load_order = load_order
        db.session.commit()

    @staticmethod
    def delete_collection(collection_id: int) -> None:
        try:
            db.session.delete(
                Collection.query.filter(Collection.id == collection_id).first()
            )
            db.session.commit()
        except sqlalchemy.orm.exc.UnmappedInstanceError as e:
            raise Exception("Cannot find collection") from e

    @staticmethod
    def add_mod_to_collection(collection_id: int, mod_id: int) -> None:
        # get the existing length so we can properly set the load order
        existing_mod_count = len(
            ModCollectionEntry.query.filter(
                ModCollectionEntry.collection_id == collection_id,
            ).all()
        )

        db.session.add(
            ModCollectionEntry(
                collection_id=collection_id,
                mod_id=mod_id,
                load_order=existing_mod_count + 1,
            )
        )

    @staticmethod
    def remove_mod_from_collection(collection_id: int, mod_id: int) -> None:
        try:
            # locate the load order of the mod being removed
            load_order = (
                ModCollectionEntry.query.filter(
                    ModCollectionEntry.mod_id == mod_id,
                )
                .first()
                .load_order
            )
            # remove the mod
            db.session.delete(
                ModCollectionEntry.query.filter(
                    Collection.id == collection_id,
                    ModCollectionEntry.mod_id == mod_id,
                ).first()
            )
            # cascade the load order change to other mods so we don't end up with a gap
            needs_reordering = ModCollectionEntry.query.filter(
                ModCollectionEntry.collection_id == collection_id,
                ModCollectionEntry.load_order > load_order,
            ).all()
            for cur_reorder in needs_reordering:
                cur_reorder.load_order -= 1
            db.session.commit()
        except Exception as e:
            raise Exception(
                "Failed to remove mod from collection (mod not found?)"
            ) from e

    @staticmethod
    def get_all_notifications():
        """
        Retrieves details about mod notifications
        """
        results = []
        for result in Notification.query.all():
            details = result.to_dict()
            results.append(details)
        return results

    @staticmethod
    def get_notification_details(notification_id: int) -> dict[str, str]:
        return Notification.query.filter(Notification.id == notification_id).first()

    @staticmethod
    def create_notification(notification_data: dict[str, str]) -> int:
        notification = Notification(
            URL=notification_data["URL"],
            enabled=notification_data["enabled"],
            send_server=notification_data.get("send_server", False),
            send_mod_update=notification_data.get("send_mod_update", False),
        )
        db.session.add(notification)
        db.session.commit()

        return notification.id

    @staticmethod
    def update_notification(
        notification_id: int, notification_data: dict[str, str]
    ) -> None:
        try:
            result = Notification.query.filter(
                Notification.id == notification_id
            ).first()
            if result:
                disallowed_attrs = [
                    "id",
                    "updated_at",
                    "created_at",
                ]  # do not allow certain fields to be modified
                for key, value in notification_data.items():
                    if key not in disallowed_attrs:
                        setattr(result, key, value)
                db.session.commit()
            else:
                raise Exception("Notification not found")
        except Exception as e:
            raise Exception("Failed to update notification") from e

    @staticmethod
    def delete_notification(notification_id: int) -> None:
        try:
            db.session.delete(
                Notification.query.filter(Notification.id == notification_id).first()
            )
            db.session.commit()
        except sqlalchemy.orm.exc.UnmappedInstanceError as e:
            raise Exception("Cannot find notification") from e


class SteamAPI:
    """
    Helper class used to interact with Steam API (that is, the web API, not steamCMD)
    """

    def __init__(self):
        self.URLs = {
            "fileDetails": "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
            "getCollectionDetails": "https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/",
        }

    def get_mod_details(self, steam_mod_id):
        """
        Retrieves basic information about a specific mod
        :param steam_mod_id: - INT, the steam mod ID to get details for
        :return:
        JSON response with details of the mod
        {
            "description": "this mod rox",
            "file_size": "<size in bytes>",
            "preview_url": "<URL to image>",
            "tags": [
                "list of tags",
                "used to tell if mod,",
                "mission, or map",
            ],
            "time_updated": "<time mod last updated>",
            "title": "<mod name>",
        }
        """
        payload = {
            "itemcount": 1,
            "publishedfileids[0]": steam_mod_id,
        }
        reply = httpx.post(
            self.URLs["fileDetails"],
            data=payload,
        )
        details = reply.json()["response"]["publishedfiledetails"][0]
        if any(x["tag"] == "Scenario" for x in details["tags"]):
            details["mod_type"] = "mission"
        elif any(x["tag"] == "Terrain" for x in details["tags"]):
            details["mod_type"] = "map"
        else:
            details["mod_type"] = "mod"
        return details

    def get_collection_mods(self, collection_id: int) -> list[int]:
        """
        Accepts a Steam collection ID and returns a list of workshop item IDs contained within it
        :param collection_id: INT - ID of the collection to get details for
        :return: a list of workshop item IDs within the collection, e.g., [123, 456]
        """
        payload = {
            "collectioncount": 1,
            "publishedfileids[0]": collection_id,
        }
        reply = httpx.post(
            self.URLs["getCollectionDetails"],
            data=payload,
        )
        details = [
            x["publishedfileid"]
            for x in reply.json()["response"]["collectiondetails"][0]["children"]
        ]
        return details


class ScheduleHelper:
    @staticmethod
    def get_schedules() -> list[dict[str, str]]:
        """
        Retrieve all currently-defined user schedules
        :return:
        """
        return [x.to_dict() for x in Schedule.query.all()]

    @staticmethod
    def create_schedule(schedule_data: dict[str, str]) -> int:
        """
        Create a new schedule
        :param schedule_data: JSON payload to create a schedule from
            must contain the user-defined name, the celery schedule, the action to take, and if it is enabled or not
        :return: ID of the newly-created schedule
        """
        schedule = Schedule(
            name=schedule_data["name"],
            celery_name=schedule_data["celery_name"],
            action=schedule_data["action"],
            enabled=schedule_data["enabled"],
        )
        db.session.add(schedule)
        db.session.commit()
        return schedule.id

    @staticmethod
    def get_schedule(schedule_id: int) -> Schedule:
        """
        Retrieve a specific schedule
        :param schedule_id: the ID of the schedule to retrieve
        :return: JSON representation of the schedule
        """
        return Schedule.query.get(schedule_id).to_dict()

    @staticmethod
    def update_schedule(schedule_id: int, schedule_data: dict[str, str]) -> None:
        try:
            result = Schedule.query.filter(Schedule.id == schedule_id).first()
            if result:
                disallowed_attrs = [
                    "id",
                    "updated_at",
                    "created_at",
                    "last_run",
                    "last_outcome",
                ]  # do not allow certain fields to be modified
                for key, value in schedule_data.items():
                    if key not in disallowed_attrs:
                        setattr(result, key, value)
                db.session.commit()
        except Exception as e:
            raise Exception("Failed to update schedule (schedule not found?)") from e

    @staticmethod
    def delete_schedule(schedule_id: int) -> None:
        try:
            db.session.delete(Schedule.query.filter(Schedule.id == schedule_id).first())
            db.session.commit()
        except sqlalchemy.orm.exc.UnmappedInstanceError as e:
            raise Exception("Cannot find schedule") from e

    def get_all_results(self):
        """
        Returns a list of all scheduled task results
        :return: DICT representing the last outcome of all schedules
        {
            "<schedule_id>": {
                <schedule_results>: <see_get_schedule_results>,
            }
        }
        """
        results = {}
        schedules = Schedule.query.all()
        for schedule in schedules:
            results[schedule.id] = self.get_schedule_results(schedule.id)
        return results

    @staticmethod
    def get_schedule_results(schedule_id: int) -> dict[str, str]:
        """
        Retrieve the last results of a specific schedule
        :param schedule_id: INT: id of the schedule to retrieve
        :return: DICT representing the last outcome
        {
            "last_outcome": "<reported_outcome_from_last_execution>",
            "last_run": "<date_time:of_last_run>",
        }
        """
        try:
            result = Schedule.query.filter(Schedule.id == schedule_id).first().to_dict()
            return {
                "last_outcome": result.get("last_outcome", "N/A"),
                "last_run": result.get("last_run", "N/A"),
            }
        except Exception as e:
            raise Exception(
                "Failed to get schedule results, likely schedule doesn't exist or hasn't run"
            ) from e


class Arma3ServerHelper:
    @staticmethod
    def get_servers() -> list[dict[str, str]]:
        """
        Retrieve all currently-defined user schedules
        :return:
        """
        return [x.to_dict() for x in ServerConfig.query.all()]

    @staticmethod
    def create_server(server_data: dict[str, str]) -> int:
        """
        Create a new schedule
        :param server_data: JSON payload to create a schedule from
            must contain the user-defined name, the celery schedule, the action to take, and if it is enabled or not
        :return: ID of the newly-created schedule
                id: Primary key identifier
        """
        schedule = ServerConfig(
            name=server_data["name"],
            description=server_data["description"],
            server_name=server_data["server_name"],
            password=server_data["password"],
            admin_password=server_data["admin_password"],
            max_players=server_data["max_players"],
            mission_file=server_data["mission_file"],
            server_config_file=server_data["server_config_file"],
            basic_config_file=server_data["basic_config_file"],
            additional_params=server_data["additional_params"],
            server_binary=server_data["server_binary"],
            collection_id=server_data.get("collection_id", None),
            is_active=server_data.get("is_active", False),
        )
        db.session.add(schedule)
        db.session.commit()
        return schedule.id

    @staticmethod
    def get_server(server_id: int, include_sensitive: bool) -> ServerConfig:
        """
        Retrieve a specific schedule
        :param server_id: the ID of the schedule to retrieve
        :param include_sensitive: whether to include sensitive information, such as the password
        :return: JSON representation of the schedule
        """
        return ServerConfig.query.get(server_id).to_dict(include_sensitive)

    @staticmethod
    def update_server(server_id: int, server_data: dict[str, str]) -> None:
        """
        Update a specific server
        Note that is_active must be set via "activate_server"
        :param server_id:
        :param server_data:
        :return:
        """
        try:
            result = ServerConfig.query.filter(ServerConfig.id == server_id).first()
            if result:
                disallowed_attrs = [
                    "id",
                    "updated_at",
                    "created_at",
                    "is_active",
                ]  # do not allow certain fields to be modified
                for key, value in server_data.items():
                    if key not in disallowed_attrs:
                        setattr(result, key, value)
                db.session.commit()
        except Exception as e:
            raise Exception("Failed to update server (server not found?)") from e

    @staticmethod
    def delete_server(server_id: int) -> None:
        try:
            db.session.delete(
                ServerConfig.query.filter(ServerConfig.id == server_id).first()
            )
            db.session.commit()
        except sqlalchemy.orm.exc.UnmappedInstanceError as e:
            raise Exception("Cannot find server") from e

    @staticmethod
    def get_active_server_details():
        active_server = ServerConfig.query.filter(ServerConfig.is_active).first()
        return active_server.to_dict(include_sensitive=True)

    @staticmethod
    def activate_server(server_id: int) -> None:
        active_servers = ServerConfig.query.filter(ServerConfig.is_active).all()
        for active_server in active_servers:
            active_server.is_active = False
        new_active_server = ServerConfig.query.filter(
            ServerConfig.id == server_id
        ).first()
        new_active_server.is_active = True
        db.session.commit()

    @staticmethod
    def is_server_running() -> bool:
        """
        Checks running processes for the default arma 3 server binary name
        :return:
        """
        procs = [x.info for x in psutil.process_iter(["name"])]
        return {"name": "arma3server_x64"} in procs or {"name": "arma3server"} in procs

    @staticmethod
    def stop_server() -> bool:
        for server_proc in psutil.process_iter():
            if server_proc.name() in ["arma3server_x64", "arma3server"]:
                server_proc.kill()
                return True
        return False


class TaskHelper:
    @staticmethod
    def log_scheduled_task_outcome(schedule_id: int, task_outcome: str):
        if schedule_id == 0:
            # this was an unscheduled task, do not update outcome
            return
        schedule = Schedule.query.filter(Schedule.id == schedule_id).first()
        if not schedule:
            raise Exception(
                f"Unable to update schedule {schedule_id} with outcome '{task_outcome}' (schedule not found)"
            )
        schedule.last_outcome = task_outcome
        schedule.last_run = datetime.utcnow()
        db.session.commit()

    @staticmethod
    def send_webhooks(task_type, task_outcome) -> None:
        notifications = []
        if task_type in ["server_restart", "server_start", "server_stop"]:
            notifications = Notification.query.filter(
                Notification.send_server, Notification.enabled
            ).all()
        elif task_type in ["mod_update"]:
            notifications = Notification.query.filter(
                Notification.send_mod_update, Notification.enabled
            ).all()
        for notification in notifications:
            try:
                httpx.post(
                    notification.URL,
                    json={
                        "task_type": task_type,
                        "outcome": task_outcome,
                    },
                )
                notification.last_run = datetime.now()
                db.session.commit()
            except Exception as e:
                print(f"Failed to send notification: {e}")
