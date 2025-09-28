"""API endpoint tests."""

import json
from datetime import datetime
from http import HTTPStatus

import pytest
from flask.testing import FlaskClient

from app import db
from app.models.collection import Collection
from app.models.mod import Mod
from app.models.mod_image import ModImage
from app.models.notification import Notification
from app.models.schedule import Schedule
from app.models.server_config import ServerConfig


@pytest.fixture
def add_cba_to_db():
    db.session.add(
        Mod(
            steam_id=450814997,
            filename="@CBA_A3",
            name="CBA_A3",
            mod_type="mod",
            arguments="",
            server_mod=False,
            size_bytes="4648405",
            steam_last_updated=datetime.utcfromtimestamp(1754197938),
            should_update=True,
        )
    )
    db.session.commit()
    db.session.add(
        ModImage(
            mod_id=1,
            image_data=b"",
            content_type="text/plain",
            created_at=datetime.utcfromtimestamp(1754197938),
        )
    )
    db.session.commit()


@pytest.fixture
def add_ace_to_db():
    db.session.add(
        Mod(
            steam_id=463939057,
            filename="@ACE3",
            name="ACE",
            mod_type="mod",
            arguments="",
            server_mod=True,
            size_bytes="4648405",
            steam_last_updated=datetime.utcfromtimestamp(1754197938),
            should_update=True,
        )
    )
    db.session.commit()


@pytest.fixture
def add_schedule_to_db():
    db.session.add(
        Schedule(
            name="wonderful schedule",
            action="server_restart",
            celery_name="every_month",
            enabled=True,
        )
    )
    db.session.commit()


@pytest.fixture
def add_notification_to_db():
    db.session.add(
        Notification(
            URL="http://127.0.0.1:1337/test",
            enabled=True,
        )
    )
    db.session.commit()


@pytest.fixture
def add_server_to_db():
    db.session.add(
        ServerConfig(
            name="Test server!",
            description="this is the description",
            server_name="name of the server",
            password="password for the server",
            admin_password="admin password for the server",
            max_players=64,
            mission_file="/home/tests/something.miz",
            server_config_file="/home/tests/server.cfg",
            basic_config_file="/home/tests/basic.cfg",
            server_mods="@sling,@beep,@boop",
            client_mods="@cba,@ace",
            additional_params="--bleh",
            server_binary="/home/tests/a3.sh",
            is_active=False,
        )
    )
    db.session.commit()


@pytest.fixture
def add_collection_to_db():
    db.session.add(
        Collection(
            name="Test collection!",
            description="this is the description",
        )
    )
    db.session.commit()


class TestArma3API:
    """
    Tests the "arma3" API endpoints
    """

    def test_health_check(self, client: FlaskClient) -> None:
        """Test health check returns 200 with correct response."""
        response = client.get("/api/arma3/health")

        assert response.status_code == HTTPStatus.OK
        data = json.loads(response.data)
        assert data["message"] == "Arma 3 API is running"

    def test_mod_not_found(self, client: FlaskClient) -> None:
        response = client.get("/api/arma3/mod/subscription")
        assert response.status_code == HTTPStatus.BAD_REQUEST
        assert (
            response.json["message"]
            == "You must include a mod ID to get subscription status"
        )

    def test_subscribe_to_mod(self, client: FlaskClient) -> None:
        """
        Tests for subscribing to a mod:
            a good subscribe with an empty DB
            a duplicate subscription
            a good subscribe with a DB with an entry
        """
        assert len(Mod.query.all()) == 0
        reply = client.post(
            "/api/arma3/mod/subscription",
            json={
                "mods": [
                    {
                        "steam_id": 450814997,  # CBA
                    }
                ],
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(Mod.query.all()) == 1
        reply = client.post(
            "/api/arma3/mod/subscription",
            json={
                "mods": [
                    {
                        "steam_id": 450814997,  # CBA
                    }
                ],
            },
        )
        assert reply.status_code == HTTPStatus.BAD_REQUEST
        assert len(Mod.query.all()) == 1
        reply = client.post(
            "/api/arma3/mod/subscription",
            json={
                "mods": [
                    {
                        "steam_id": 463939057,  # ACE 3
                    }
                ],
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(Mod.query.all()) == 2
        reply = client.get(
            "/api/arma3/mod/subscription/2",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"]["mod_type"] == "mod"
        reply = client.post(
            "/api/arma3/mod/subscription",
            json={
                "mods": [
                    {
                        "steam_id": 648775794,  # Isla Abramia
                    }
                ],
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(Mod.query.all()) == 3
        reply = client.get(
            "/api/arma3/mod/subscription/3",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"]["mod_type"] == "map"

    def test_unscribe_from_mod(self, client: FlaskClient, add_cba_to_db: None) -> None:
        # populate the database with an entry so we can remove it
        add_cba_to_db  # noqa: B018
        assert len(Mod.query.all()) == 1

        reply = client.delete(
            "/api/arma3/mod/subscription/1",
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(Mod.query.all()) == 0

    def test_get_mod_details(self, client: FlaskClient, add_cba_to_db: None) -> None:
        add_cba_to_db  # noqa: B018
        assert len(Mod.query.all()) == 1
        reply = client.get(
            "/api/arma3/mod/subscription/1",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"]["filename"] == "@CBA_A3"
        assert reply.json["results"]["size_bytes"] == 4648405
        assert reply.json["results"]["steam_id"] == 450814997
        assert reply.json["results"]["steam_last_updated"] == "2025-08-03T05:12:18"

    def test_get_mods(
        self, client: FlaskClient, add_cba_to_db: None, add_ace_to_db: None
    ) -> None:
        add_cba_to_db  # noqa: B018
        add_ace_to_db  # noqa: B018
        assert len(Mod.query.all()) == 2
        reply = client.get(
            "/api/arma3/mod/subscriptions",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"][0]["filename"] == "@CBA_A3"
        assert reply.json["results"][0]["size_bytes"] == 4648405
        assert reply.json["results"][0]["steam_id"] == 450814997
        assert reply.json["results"][0]["steam_last_updated"] == "2025-08-03T05:12:18"
        assert reply.json["results"][1]["filename"] == "@ACE3"
        assert reply.json["results"][1]["size_bytes"] == 4648405
        assert reply.json["results"][1]["steam_id"] == 463939057
        assert reply.json["results"][1]["steam_last_updated"] == "2025-08-03T05:12:18"

    def test_patch_subscribed_mod(
        self, client: FlaskClient, add_cba_to_db: None
    ) -> None:
        add_cba_to_db  # noqa: B018
        assert len(Mod.query.all()) == 1
        reply = client.patch(
            "/api/arma3/mod/subscription/1",
            json={
                "name": "NOT_CBA3",
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert "Updated successfully" in reply.json["message"]
        assert len(Mod.query.all()) == 1
        assert len(Mod.query.filter(Mod.name == "NOT_CBA3").all())

    def test_subscribe_adds_image(
        self, client: FlaskClient, add_cba_to_db: None
    ) -> None:
        add_cba_to_db  # noqa: B018
        assert len(Mod.query.all()) == 1
        reply = client.get(
            "/api/arma3/mod/subscription/1/image",
        )
        assert reply.status_code == HTTPStatus.OK

    def test_mod_download(self) -> None:
        """
        I'm skipping mod download tests. this is bad, but testing with celery is a pain, and I don't think it's worth it
        :return:
        """
        pass

    def test_schedule_create(self, client: FlaskClient) -> None:
        assert len(Schedule.query.all()) == 0
        reply = client.post(
            "/api/arma3/schedule",
            json={
                "name": "wonderful schedule",
                "action": "server_restart",
                "celery_name": "every_month",
                "enabled": True,
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["result"] == 1
        assert len(Schedule.query.all()) == 1

    def test_schedule_list(self, client: FlaskClient, add_schedule_to_db: None) -> None:
        add_schedule_to_db  # noqa: B018
        reply = client.get(
            "/api/arma3/schedules",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"][0]["action"] == "server_restart"
        assert reply.json["results"][0]["celery_name"] == "every_month"
        assert reply.json["results"][0]["enabled"]
        assert reply.json["results"][0]["name"] == "wonderful schedule"

    def test_schedule_update(
        self, client: FlaskClient, add_schedule_to_db: None
    ) -> None:
        add_schedule_to_db  # noqa: B018
        assert len(Schedule.query.all()) == 1
        reply = client.patch(
            "/api/arma3/schedule/1",
            json={
                "name": "wonderful schedule, now updated",
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(Schedule.query.all()) == 1
        reply = client.get(
            "/api/arma3/schedules",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"][0]["action"] == "server_restart"
        assert reply.json["results"][0]["celery_name"] == "every_month"
        assert reply.json["results"][0]["enabled"]
        assert reply.json["results"][0]["name"] == "wonderful schedule, now updated"

    def test_schedule_delete(
        self, client: FlaskClient, add_schedule_to_db: None
    ) -> None:
        add_schedule_to_db  # noqa: B018
        assert len(Schedule.query.all()) == 1
        reply = client.delete(
            "/api/arma3/schedule/1",
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(Schedule.query.all()) == 0

    def test_server_create(self, client: FlaskClient) -> None:
        assert len(ServerConfig.query.all()) == 0
        reply = client.post(
            "/api/arma3/server",
            json={
                "name": "Test server!",
                "description": "this is the description",
                "server_name": "name of the server",
                "password": "password for the server",
                "admin_password": "admin password for the server",
                "max_players": 64,
                "mission_file": "/home/tests/something.miz",
                "server_config_file": "/home/tests/server.cfg",
                "basic_config_file": "/home/tests/basic.cfg",
                "server_mods": "@sling,@beep,@boop",
                "client_mods": "@cba,@ace",
                "additional_params": "--bleh",
                "server_binary": "/home/tests/a3.sh",
                "is_active": False,
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["result"] == 1
        assert len(ServerConfig.query.all()) == 1

    def test_server_list(self, client: FlaskClient, add_server_to_db: None) -> None:
        add_server_to_db  # noqa: B018
        reply = client.get(
            "/api/arma3/servers",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"][0]["additional_params"] == "--bleh"
        assert reply.json["results"][0]["basic_config_file"] == "/home/tests/basic.cfg"
        assert reply.json["results"][0]["server_mods"] == "@sling,@beep,@boop"
        assert not reply.json["results"][0]["is_active"]
        assert "admin_password" not in reply.json["results"][0].keys()
        reply = client.get(
            "/api/arma3/server/1?include_sensitive=true",
        )
        assert reply.status_code == HTTPStatus.OK
        assert "admin_password" in reply.json["results"].keys()

    def test_server_update(self, client: FlaskClient, add_server_to_db: None) -> None:
        add_server_to_db  # noqa: B018
        assert len(ServerConfig.query.all()) == 1
        reply = client.patch(
            "/api/arma3/server/1",
            json={
                "name": "wonderful server, now updated",
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(ServerConfig.query.all()) == 1
        reply = client.get(
            "/api/arma3/servers",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"][0]["name"] == "wonderful server, now updated"

    def test_server_delete(self, client: FlaskClient, add_server_to_db: None) -> None:
        add_server_to_db  # noqa: B018
        assert len(ServerConfig.query.all()) == 1
        reply = client.delete(
            "/api/arma3/server/1",
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(ServerConfig.query.all()) == 0

    def test_collection_create(self, client: FlaskClient) -> None:
        assert len(Collection.query.all()) == 0
        reply = client.post(
            "/api/arma3/mod/collection",
            json={
                "name": "Test collection!",
                "description": "this is the description",
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["result"] == 1
        assert len(Collection.query.all()) == 1

    def test_collection_list(
        self, client: FlaskClient, add_collection_to_db: None
    ) -> None:
        add_collection_to_db  # noqa: B018
        reply = client.get(
            "/api/arma3/mod/collections",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"][0]["description"] == "this is the description"
        assert reply.json["results"][0]["mod_count"] == 0

    def test_collection_update(
        self, client: FlaskClient, add_collection_to_db: None, add_cba_to_db: None
    ) -> None:
        add_collection_to_db  # noqa: B018
        add_cba_to_db  # noqa: B018
        assert len(Collection.query.all()) == 1
        reply = client.patch(
            "/api/arma3/mod/collection/1/mods",
            json={
                "mods": [1],
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(Collection.query.all()) == 1
        reply = client.get(
            "/api/arma3/mod/collections",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"][0]["mod_count"] == 1
        assert reply.json["results"][0]["mods"][0]["mod"]["name"] == "CBA_A3"

    def test_collection_delete(
        self, client: FlaskClient, add_collection_to_db: None, add_cba_to_db: None
    ) -> None:
        add_collection_to_db  # noqa: B018
        add_cba_to_db  # noqa: B018
        assert len(Collection.query.all()) == 1
        reply = client.patch(
            "/api/arma3/mod/collection/1/mods",
            json={
                "mods": [1],
            },
        )
        assert reply.status_code == HTTPStatus.OK
        reply = client.delete(
            "/api/arma3/mod/collection/1/mods",
            json={
                "mods": [1],
            },
        )
        assert reply.status_code == HTTPStatus.OK
        reply = client.get(
            "/api/arma3/mod/collections",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"][0]["mod_count"] == 0
        reply = client.delete(
            "/api/arma3/mod/collection/1",
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(Collection.query.all()) == 0

    def test_notification_create(self, client: FlaskClient) -> None:
        assert len(Notification.query.all()) == 0
        reply = client.post(
            "/api/arma3/notification",
            json={
                "name": "Test notification!",
                "URL": "http://127.0.0.1:1337/test",
                "enabled": False,
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["result"] == 1
        assert len(Notification.query.all()) == 1

    def test_notification_list(
        self, client: FlaskClient, add_notification_to_db: None
    ) -> None:
        add_notification_to_db  # noqa: B018
        reply = client.get(
            "/api/arma3/notifications",
        )
        assert reply.status_code == HTTPStatus.OK
        assert reply.json["results"][0]["enabled"]

    def test_notification_update(
        self, client: FlaskClient, add_notification_to_db: None, add_cba_to_db: None
    ) -> None:
        add_notification_to_db  # noqa: B018
        assert len(Notification.query.all()) == 1
        reply = client.patch(
            "/api/arma3/notification/1",
            json={
                "URL": "notification 2",
            },
        )
        assert reply.status_code == HTTPStatus.OK

    def test_notification_delete(
        self, client: FlaskClient, add_notification_to_db: None, add_cba_to_db: None
    ) -> None:
        add_notification_to_db  # noqa: B018
        assert len(Notification.query.all()) == 1
        reply = client.delete(
            "/api/arma3/notification/1",
            json={
                "mods": [1],
            },
        )
        assert reply.status_code == HTTPStatus.OK
        assert len(Notification.query.all()) == 0
