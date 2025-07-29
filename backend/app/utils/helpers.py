"""Utility helper functions."""
import subprocess
import os
import shutil
from xmlrpc.client import Binary

import httpx
from datetime import datetime
import sqlalchemy
from app.models.mod import Mod
from app.models.mod_image import ModImage
from app import db


# Helper functions will be added here as needed
class Arma3ModManager:
    """
    Manager for all things Arma 3 mods
    Note that "mod_id" refers to the internal ID used by this application, and "steam_mod_id" refers to the steam mod ID
    """
    def __init__(self, steam_cmd_path: str, steam_cmd_user: str, mod_staging_dir: str, mod_dest_dir: str, mod_backup_dir:str) -> None:
        self.steam_cmd_path = steam_cmd_path
        self.steam_cmd_user = steam_cmd_user
        self.arma3_app_id = 107410
        self.staging_dir = mod_staging_dir
        self.dst_dir = mod_dest_dir
        self.backup_dir = mod_backup_dir
        self.mission_dir = os.path.join(mod_dest_dir, "mpmissions")
        self._validate_dirs()
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
                details['image_available'] = True
            except sqlalchemy.orm.exc.NoResultFound:
                details['image_available'] = False
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
            details['image_available'] = True
        except sqlalchemy.orm.exc.NoResultFound:
            details['image_available'] = False
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
                disallowed_attrs = ['id', 'updated_at']  # do not allow certain fields to be modified
                for key, value in updated_data.items():
                    if key not in disallowed_attrs:
                        setattr(result, key, value)
                db.session.commit()
        except Exception as e:
            raise Exception("Failed to update mod (mod not found?)")

    def remove_subscribed_mod(self, mod_id: int) -> None:
        """
        Removes a subscribed mod
        :param mod_id: - INT, the internal ID of the mod to get details for
        :return:
        """
        # TODO: delete the local files
        try:
            db.session.delete(ModImage.query.filter(ModImage.mod_id == mod_id).first())
            db.session.commit()
            db.session.delete(Mod.query.filter(Mod.id == mod_id).first())
            db.session.commit()
        except sqlalchemy.orm.exc.UnmappedInstanceError:
            raise Exception("Cannot find subscribed mod")

    def add_subscribed_mod(self, mod_steam_id: int) -> None:
        """
        Adds a subscribed mod, which triggers a download
        :param mod_steam_id: - INT, the internal ID of the mod to get details for
        :return:
        """
        # TODO: enqueue a download job
        mod_details = self.steam_api.get_mod_details(mod_steam_id)
        if mod_details['mod_type'] == 'mission':
            local_path = self.mission_dir
        else:
            local_path = self.dst_dir

        prepared_mod = Mod(
            steam_id=mod_steam_id,
            filename=mod_details.get('filename', mod_details['title']),
            name=mod_details['title'],
            mod_type=mod_details['mod_type'],
            local_path=local_path,
            arguments='',
            server_mod=False,
            size_bytes=mod_details['file_size'],
            steam_last_updated=datetime.utcfromtimestamp(
                mod_details['time_updated']
            ),
        )
        db.session.add(prepared_mod)
        try:
            db.session.commit()
        except sqlalchemy.exc.IntegrityError as e:
            print(str(e))
            raise Exception("This mod is already subscribed")

        img_data = httpx.get(mod_details['preview_url'])
        preview_image = ModImage(
            mod_id=prepared_mod.id,
            image_data=bytes(img_data.content),
            content_type=img_data.headers.get('content-type'),
        )
        db.session.add(preview_image)
        db.session.commit()

    def get_subscribed_mod_image(self, mod_id: int) -> Binary:
        """
        Retrieves preview image for a specific mod
        :param mod_id: - INT, the internal ID of the mod to get details for
        :return:
        """
        return ModImage.query.filter(ModImage.id == mod_id).first().to_dict(include_data=True)

    def _download_single_mod_(self, mod_id: int, dst_dir: str):
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
        self._backup_single_mod_(
            os.path.join(
                self.dst_dir,
                dst_dir,
            ),
            self.backup_dir,
            dst_dir,
        )
        self._move_single_mod_(mod_id, dst_dir)

    @staticmethod
    def _backup_single_mod_(src_dir: str, dst_dir: str, mod_id: int):
        """
        Moves an existing mod to a different location
        Intended to prevent a single corrupted file from ruining the night
        Not really a backup and of questionable value, TBH
        :param src_dir: - STR, the source directory to move the mod from
        :param dst_dir: - STR, the destination directory to move the mod to
        :param mod_id:  - INT, the internal ID of the mod
        :return:
        """
        backup_dir = os.path.join(
            dst_dir,
            mod_id,
        )
        if os.path.exists(backup_dir):
            shutil.rmtree(backup_dir)
        os.rename(
            src_dir,
            backup_dir
        )

    def _move_single_mod_(self, mod_id: int, dst_dir: str):
        """
        Moves a downloaded mod from the staging directory to the destination directory
        :param mod_id: - INT, the internal ID of the mod to get details for
        :param dst_dir: - STR, the destination directory to move the downloaded mod to
        :return:
        """
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
            )
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
                    os.rename(os.path.join(root, name), os.path.join(root, name.lower()))
                except OSError:
                    pass  # can't rename it, skip

        # starts from the bottom so paths further up remain valid after renaming
        for root, dirs, files in os.walk(dst_dir, topdown=False):
            rename_all(root, dirs)
            rename_all(root, files)

    def _validate_dirs(self):
        """
        Validate that directories exist before attempting to use them
        :return:
        """
        try:
            assert os.path.exists(self.staging_dir)
            assert os.path.exists(self.dst_dir)
            assert os.path.exists(self.backup_dir)
        except AssertionError:
            raise Exception("One or more directories were not found")

    def add_mod_entry(self, mod_data: dict[str, str]):
        pass

    def remove_mod_entry(self, mod_data):
        pass


class SteamAPI:
    """
    Helper class used to interact with Steam API (that is, the web API, not steamCMD)
    """
    def __init__(self):
        self.URLs = {
            "fileDetails": "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
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
            self.URLs['fileDetails'],
            data=payload,
        )
        details = reply.json()['response']['publishedfiledetails'][0]
        if any(x['tag'] == 'Scenario' for x in details['tags']):
            details['mod_type'] = 'mission'
        elif any(x['tag'] == 'Map' for x in details['tags']):
            details['mod_type'] = 'map'
        else:
            details['mod_type'] = 'mod'
        return details
