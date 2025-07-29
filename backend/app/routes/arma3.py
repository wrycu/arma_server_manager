from http import HTTPStatus

from flask import Blueprint, Response, current_app, request

a3_bp = Blueprint("arma3", __name__)


@a3_bp.route("/health", methods=["GET"])
def health_check() -> tuple[dict[str, str], int]:
    """Health check endpoint for monitoring.

    Returns:
        JSON response with health status and HTTP 200
    """
    return {"status": "healthy", "message": "Arma 3 API is running"}, HTTPStatus.OK


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
            current_app.config["MOD_MANAGERS"]["ARMA3"].get_subscribed_mods(),
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@a3_bp.route("/mod/subscription", methods=["POST"])
def add_mod_subscription() -> tuple[dict[str, str], int]:
    """
    Adds a mod to the tracked mod list, aka subscribes to it
    :return:
    """
    try:
        for mod in request.json["mods"]:
            current_app.config["MOD_MANAGERS"]["ARMA3"].add_subscribed_mod(
                mod["steam_id"]
            )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully subscribed"}, HTTPStatus.OK


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
            "message": "Subscribed successfully",
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


"""
-----------------------------------------------------------------------------------------------------------------------
TODO: this entire section (skeletoned out)
-----------------------------------------------------------------------------------------------------------------------
"""


@a3_bp.route("/mod/collection", methods=["POST", "DELETE", "GET"])
def mod_collection() -> tuple[dict[str, str], int]:
    """Health check endpoint for monitoring.

    Returns:
        JSON response with health status and HTTP 200
    """
    return {"status": "healthy", "message": "API is running"}, HTTPStatus.OK


@a3_bp.route("/collection", methods=["POST", "DELETE", "GET"])
def collection_manage() -> tuple[dict[str, str], int]:
    """Health check endpoint for monitoring.

    Returns:
        JSON response with health status and HTTP 200
    """
    return {"status": "healthy", "message": "API is running"}, HTTPStatus.OK
