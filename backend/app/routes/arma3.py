from http import HTTPStatus
from typing import Any

from flask import Blueprint, Response, current_app, request

from app.tasks.background import (
    download_arma3_mod,
    headless_client_start,
    headless_client_stop,
    mod_update,
    remove_arma3_mod,
    server_start,
    server_stop,
    server_update,
    update_arma3_mod,
)

a3_bp = Blueprint("arma3", __name__)


@a3_bp.route("/health", methods=["GET"])
def health_check() -> tuple[dict[str, str], int]:
    """Health check endpoint for monitoring.

    Returns:
        JSON response with health status and HTTP 200
    """
    return {"status": "healthy", "message": "Arma 3 API is running"}, HTTPStatus.OK


@a3_bp.route("/steam/collection/<int:collection_id>", methods=["GET"])
def collection_extract(collection_id: int) -> tuple[dict[str, str], int]:
    """Retrieve a list of workshop items contained within a Steam collection

    Returns:
        JSON response with workshop items
    """
    str_to_bool = {
        "true": True,
        "false": False,
        True: True,
        False: False,
    }

    try:
        return {
            "results": current_app.config["MOD_MANAGERS"][
                "ARMA3"
            ].steam_api.get_collection_mods(
                collection_id,
                str_to_bool[request.args.get("exclude_subscribed", False)],
            ),
            "message": "Retrieved successfully",
        }, HTTPStatus.OK
    except KeyError:
        return {
            "message": "Not a collection",
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/helper/<int:mod_id>", methods=["GET"])
def get_mod_overview(mod_id: int) -> tuple[dict[str, str], int]:
    """
    Retrieves details about a specific mod from the Steam API
    Intended to help in the development workflow, or to prefetch some data for the web UI
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
    return {
        "results": current_app.config["MOD_MANAGERS"][
            "ARMA3"
        ].steam_api.get_mod_details(mod_id),
        "message": "Retrieved successfully",
    }, HTTPStatus.OK


@a3_bp.route("/mod/subscriptions", methods=["GET"])
def get_mod_subscriptions() -> tuple[dict[str, str], int]:
    """
    Retrieve a list of existing mod subscriptions.
    :return:
        JSON response with list of existing mod subscriptions
    """
    try:
        return (
            {
                "results": current_app.config["MOD_MANAGERS"][
                    "ARMA3"
                ].get_subscribed_mods(),
                "message": "Retrieved successfully",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/subscription", methods=["POST"])
def add_mod_subscription() -> tuple[dict[str, Any], int]:
    """
    Adds a mod to the tracked mod list, aka subscribes to it
    :return:
    """
    created = []
    try:
        for mod in request.json["mods"]:
            created.append(
                current_app.config["MOD_MANAGERS"]["ARMA3"].add_subscribed_mod(
                    mod["steam_id"]
                )
            )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully subscribed", "ids": created}, HTTPStatus.OK


@a3_bp.route("/mod/subscription", methods=["GET"])
def mod_subscription_not_found() -> tuple[dict[str, str], int]:
    """
    Helper endpoint to explain why this was a bad request
    :return:
    """
    return {
        "message": "You must include a mod ID to get subscription status"
    }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/subscription/<int:mod_id>", methods=["GET"])
def get_mod_subscription_details(mod_id: int) -> tuple[dict[str, str], int]:
    """
    Retrieves details about a specific mod
    :return:
        JSON response with list of existing mod subscriptions
    """
    try:
        return {
            "results": current_app.config["MOD_MANAGERS"][
                "ARMA3"
            ].get_subscribed_mod_details(mod_id),
            "message": "Retrieved successfully",
        }, HTTPStatus.OK
    except AttributeError:
        return {
            "message": "Mod not found",
        }, HTTPStatus.NOT_FOUND
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/subscription/<int:mod_id>", methods=["PATCH"])
def update_mod_subscription_details(mod_id: int) -> tuple[dict[str, str], int]:
    """
    Updates details about a specific mod
    :return:
        JSON response indicating
    """
    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].update_subscribed_mod(
            mod_id, request.json
        )
        return {
            "message": "Updated successfully",
        }, HTTPStatus.OK
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/subscription/<int:mod_id>", methods=["DELETE"])
def remove_mod_subscription(mod_id: int) -> tuple[dict[str, str], int]:
    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].remove_subscribed_mod(mod_id)
        return {
            "message": "Unsubscribed successfully",
        }, HTTPStatus.OK
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/subscription/<int:mod_id>/image", methods=["GET"])
def get_mod_subscription_image(
    mod_id: int,
) -> tuple[Response, int] | tuple[dict[str, str], int]:
    """
    Retrieves image for a specific mod
    :return:
        Image content ONLY, or a JSON blob indicating the image could not be found
    """
    try:
        image = current_app.config["MOD_MANAGERS"]["ARMA3"].get_subscribed_mod_image(
            mod_id
        )
        return (
            Response(
                image["image_data"],
                headers={"Content-Type": image["content_type"]},
            ),
            HTTPStatus.OK,
        )
    except AttributeError:
        return {
            "message": "Image not found",
        }, HTTPStatus.NOT_FOUND
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/<int:mod_id>/download", methods=["POST"])
def trigger_mod_download(
    mod_id: int,
) -> tuple[Response, int] | tuple[dict[str, str], int]:
    return {
        "status": download_arma3_mod.delay(mod_id).id,
        "message": "Downloaded queued",
    }, HTTPStatus.OK


@a3_bp.route("/mod/<int:mod_id>/download", methods=["DELETE"])
def trigger_mod_delete(
    mod_id: int,
) -> tuple[Response, int] | tuple[dict[str, str], int]:
    return {
        "status": remove_arma3_mod.delay(mod_id).id,
        "message": "Remove queued",
    }, HTTPStatus.OK


@a3_bp.route("/mod/<int:mod_id>/update", methods=["POST"])
def trigger_mod_update(
    mod_id: int,
) -> tuple[Response, int] | tuple[dict[str, str], int]:
    return {
        "status": update_arma3_mod.delay(mod_id).id,
        "message": "Downloaded queued",
    }, HTTPStatus.OK


@a3_bp.route("/mods/update", methods=["POST"])
def trigger_all_mod_update() -> tuple[Response, int] | tuple[dict[str, str], int]:
    return {
        "status": mod_update.delay().id,
        "message": "Mod updates queued",
    }, HTTPStatus.OK


@a3_bp.route("/mod/collections", methods=["GET"])
def get_mod_collections() -> tuple[dict[str, str], int]:
    """
    Returns all currently defined collections

    Returns:
        JSON response with health status and HTTP 200
    """
    try:
        return (
            {
                "results": current_app.config["MOD_MANAGERS"][
                    "ARMA3"
                ].get_all_collections(),
                "message": "Retrieved successfully",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/collection", methods=["GET"])
def get_mod_collection_400() -> tuple[dict[str, str], int]:
    """
    Helper endpoint to explain why this was a bad request
    :return:
    """
    return {
        "message": "You must include a collection ID to get details"
    }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/collection", methods=["POST"])
def create_mod_collection() -> tuple[dict[str, str], int]:
    """
    Creates a new collection

    Returns:
        JSON object describing outcome and ID of created collection
    """
    try:
        return (
            {
                "result": current_app.config["MOD_MANAGERS"]["ARMA3"].create_collection(
                    request.json
                ),
                "message": "Created collection successfully",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/collection/<int:collection_id>", methods=["GET"])
def get_mod_collection(collection_id: int) -> tuple[dict[str, str], int]:
    """
    Returns all currently defined collections

    Returns:
        JSON description of collections
    """
    try:
        return (
            {
                "results": current_app.config["MOD_MANAGERS"][
                    "ARMA3"
                ].get_collection_details(collection_id),
                "message": "Retrieved successfully",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/collection/<int:collection_id>", methods=["PATCH"])
def update_mod_collection(collection_id: int) -> tuple[dict[str, str], int]:
    """
    Updates a mod collection (most commonly, adding or removing mods from it)

    Returns:
        JSON description of outcome
    """
    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].update_collection(
            collection_id,
            request.json,
        )
        return (
            {
                "message": "Successfully updated collection",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/collection/<int:collection_id>", methods=["DELETE"])
def delete_mod_collection(collection_id: int) -> tuple[dict[str, str], int]:
    """
    Delete a collection

    Returns:
        JSON representation of outcome
    """
    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].delete_collection(
            collection_id,
        )
        return (
            {
                "message": "Successfully deleted collection",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/collection/<int:collection_id>/mods", methods=["PATCH"])
def add_mod_to_collection(collection_id: int) -> tuple[dict[str, str], int]:
    """
    Add mods to a collection

    Returns:
        JSON description of outcome
    """
    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].update_collection(
            collection_id,
            request.json,
        )
        return (
            {
                "message": "Successfully added mod to collection",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route(
    "/mod/collection/<int:collection_id>/mods/<int:mod_id>/load/<int:load_slot>",
    methods=["PATCH"],
)
def modify_mod_load_order(
    collection_id: int, mod_id: int, load_slot: int
) -> tuple[dict[str, str], int]:
    """
    Modifies the load order of mods within a collection
    Note that it is possible to generate impossible load orders with this (e.g., multiple mods with the same load slot)
    I _could_ fix this, but then it'd be a lot harder to allow swapping load order, so I haven't

    Returns:
        JSON description of outcome
    """
    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].reorder_mod_load(
            collection_id,
            mod_id,
            load_slot,
        )
        return (
            {
                "message": "Successfully updated collection load order",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route(
    "/mod/collection/<int:collection_id>/mods/<int:mod_id>", methods=["DELETE"]
)
def delete_mod_from_collection(
    collection_id: int, mod_id: int
) -> tuple[dict[str, str], int]:
    """
    Remove mods from a collection

    Returns:
        JSON description of outcome
    """
    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].remove_mod_from_collection(
            collection_id,
            mod_id,
        )
        return (
            {
                "message": "Successfully deleted mod from collection",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/servers", methods=["GET"])
def get_servers() -> tuple[dict[str, str], int]:
    """
    Retrieves all user-defined servers
    :return:
        JSON representation of all servers
    """
    str_to_bool = {
        "true": True,
        "false": False,
        True: True,
        False: False,
    }
    try:
        return (
            {
                "results": current_app.config["A3_SERVER_HELPER"].get_servers(
                    str_to_bool[request.args.get("include_sensitive", False)],
                ),
                "message": "Retrieved successfully",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/server", methods=["GET"])
def get_server_404() -> tuple[dict[str, str], int]:
    """
    Helper endpoint to explain why this was a bad request
    :return:
    """
    return {
        "message": "You must include a server ID to get server status"
    }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/server", methods=["POST"])
def create_server() -> tuple[dict[str, Any], int]:
    """
    Creates a new server configuration.

    Returns:
        JSON response with message and the ID of the created server
    """
    try:
        server_id = current_app.config["A3_SERVER_HELPER"].create_server(request.json)
        return {
            "message": "Server created successfully",
            "result": server_id,
        }, HTTPStatus.CREATED
    except KeyError as e:
        return {
            "message": f"Missing required field: {e}",
        }, HTTPStatus.BAD_REQUEST
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/server/update", methods=["POST"])
def update_server_binary() -> tuple[dict[str, str], int]:
    """
    Updates the Arma 3 installed instance
    Returns:
        JSON response with message and async job ID (to look up job status)
    """
    try:
        return {
            "status": server_update.delay().id,
            "message": "Server update queued",
        }, HTTPStatus.OK
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/server/start", methods=["POST"])
def start_server() -> tuple[dict[str, str], int]:
    """
    Starts a server on-demand
    Returns:
        JSON response with message and async job ID (to look up job status)
    """
    try:
        return {
            "status": server_start.delay().id,
            "message": "Server start queued",
        }, HTTPStatus.OK
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/server/stop", methods=["POST"])
def stop_server() -> tuple[dict[str, str], int]:
    """
    Stops a server on-demand
    Returns:
        JSON response with message and async job ID (to look up job status)
    """
    try:
        return {
            "status": server_stop.delay().id,
            "message": "Server stop queued",
        }, HTTPStatus.OK
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/server/<int:server_id>", methods=["GET"])
def get_server(server_id: int) -> tuple[dict[str, str], int]:
    """
    Retrieves information about a specific server
    Use the URL parameter "include_sensitive" to retrieve sensitive information (defaults to false if missing)
    :return:
        JSON response with details of a single server
    """
    try:
        str_to_bool = {
            "true": True,
            "false": False,
            True: True,
            False: False,
        }
        created = current_app.config["A3_SERVER_HELPER"].get_server(
            server_id,
            str_to_bool[request.args.get("include_sensitive", False)],
        )
    except AttributeError:
        return {
            "message": "Server not found",
        }, HTTPStatus.NOT_FOUND
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully retrieved", "results": created}, HTTPStatus.OK


@a3_bp.route("/server/<int:server_id>", methods=["PATCH"])
def update_server(server_id: int) -> tuple[dict[str, str], int]:
    """
    Update a single user-defined server
    :return:
        Status code indicating success or failure
    """
    try:
        current_app.config["A3_SERVER_HELPER"].update_server(
            server_id,
            request.json,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully updated"}, HTTPStatus.OK


@a3_bp.route("/hc/start", methods=["POST"])
def start_hc() -> tuple[dict[str, str], int]:
    """
    Starts a headless client on-demand
    Returns:
        JSON response with message and async job ID (to look up job status)
    """
    try:
        return {
            "status": headless_client_start.delay().id,
            "message": "headless client start queued",
        }, HTTPStatus.OK
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/hc/stop", methods=["POST"])
def stop_hc() -> tuple[dict[str, str], int]:
    """
    Stops a headless client on-demand
    Returns:
        JSON response with message and async job ID (to look up job status)
    """
    try:
        return {
            "status": headless_client_stop.delay().id,
            "message": "headless client stop queued",
        }, HTTPStatus.OK
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST
