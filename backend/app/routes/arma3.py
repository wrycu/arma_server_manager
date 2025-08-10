from http import HTTPStatus
from typing import Any

from celery.result import AsyncResult
from flask import Blueprint, Response, current_app, request

from app.tasks.background import download_arma3_mod, remove_arma3_mod

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


@a3_bp.route("/async/<int:job_id>", methods=["GET"])
def async_status(job_id) -> tuple[dict[str, str], int]:
    """Look up the current state of a running async job, including the result (if finished)

    Returns:
        JSON response with current status and result (if applicable)
    """
    result = AsyncResult(job_id)
    if result.state == "SUCCESS":
        return result.result, HTTPStatus.OK
    else:
        return {"status": result.status, "message": result.result}, HTTPStatus.OK


@a3_bp.route("/schedules", methods=["GET"])
def get_schedules() -> tuple[dict[str, str], int]:
    """
    Retrieves all user-defined schedules
    :return:
        JSON representation of all schedules
    """
    try:
        return (
            {
                "results": current_app.config["SCHEDULE_HELPER"].get_schedules(),
                "message": "Retrieved successfully",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

@a3_bp.route("/schedule", methods=["GET"])
def get_schedule_404() -> tuple[dict[str, str], int]:
    """
    Helper endpoint to explain why this was a bad request
    :return:
    """
    return {
        "message": "You must include a schedule ID to get schedule status"
    }, HTTPStatus.BAD_REQUEST

@a3_bp.route("/schedule", methods=["POST"])
def create_schedule() -> tuple[dict[str, str], int]:
    """
    Creates a user-defined schedule (which relies on a celery schedule)
    Must contain a JSON blob looking like this:
    {
        "name": "<USER_DEFINED_NAME>",
        "celery_name": "<NAME_OF_CELERY_SCHEDULE>",
        "action": "<ACTION_TO_TAKE_WHEN_SCHEDULE_IS_RUN>",
        "enabled": "<IF_THIS_SCHEDULE_IS_ENABLED>",
    }
    Returns:
        JSON response with health status and HTTP 200
    """
    try:
        created = current_app.config["SCHEDULE_HELPER"].create_schedule(
            request.json,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully created", "result": created}, HTTPStatus.OK

@a3_bp.route("/schedule/<int:schedule_id>", methods=["GET"])
def get_schedule(schedule_id: int) -> tuple[dict[str, str], int]:
    """
    Retrieves information about a specific schedule
    :return:
        JSON response with details of a single schedule
    """
    try:
        created = current_app.config["SCHEDULE_HELPER"].get_schedule(
            schedule_id,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully retrieved", "results": created}, HTTPStatus.OK

@a3_bp.route("/schedule/<int:schedule_id>", methods=["PATCH"])
def update_schedule(schedule_id: int) -> tuple[dict[str, str], int]:
    """
    Update a single user-defined schedule
    :return:
        Status code indicating success or failure
    """
    try:
        current_app.config["SCHEDULE_HELPER"].update_schedule(
            schedule_id,
            request.json,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully updated"}, HTTPStatus.OK

@a3_bp.route("/schedule/<int:schedule_id>", methods=["DELETE"])
def delete_schedule(schedule_id: int) -> tuple[dict[str, str], int]:
    """
    Delete a single user-defined schedule
    :return:
        Status code indicating success or failure
    """
    try:
        current_app.config["SCHEDULE_HELPER"].delete_schedule(
            schedule_id,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully deleted"}, HTTPStatus.OK

@a3_bp.route("/schedule/<int:schedule_id>/trigger", methods=["POST"])
def trigger_schedule(schedule_id: int) -> tuple[dict[str, str], int]:
    """
    Manually triggers a schedule, rather than waiting for the normal activation

    Returns:
        job ID
    """
    try:
        print("hi, scheduled")
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully triggered (but not really)"}, HTTPStatus.OK
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
