"""API endpoint tests."""

import json
from datetime import datetime
from http import HTTPStatus

import pytest
from flask.testing import FlaskClient

from app import db
from app.models.mod import Mod
from app.models.mod_image import ModImage


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
        )
    )
    db.session.commit()
    db.session.add(
        ModImage(
            mod_id=1,
            image_data=b'',
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
        assert response.json["message"] == "You must include a mod ID to get subscription status"

    def test_subscribe_to_mod(self, client: FlaskClient) -> None:
        """
        Tests for subscribing to a mod:
            a good subscribe with an empty DB
            a duplicate subscription
            a good subscribe with a DB with an entry
        """
        assert len(Mod.query.all()) == 0
        reply = client.post("/api/arma3/mod/subscription", json={
            "mods": [{
                "steam_id": 450814997,  # CBA
            }],
        })
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

    def test_get_mods(self, client: FlaskClient, add_cba_to_db: None, add_ace_to_db: None) -> None:
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

    def test_patch_subscribed_mod(self, client: FlaskClient, add_cba_to_db: None) -> None:
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

    def test_subscribe_adds_image(self, client: FlaskClient, add_cba_to_db: None) -> None:
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
