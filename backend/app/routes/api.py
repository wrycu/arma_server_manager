"""API routes with proper type hints and documentation."""

from http import HTTPStatus

from celery.result import AsyncResult
from flask import Blueprint, current_app, request

api_bp = Blueprint("api", __name__)


@api_bp.route("/health", methods=["GET"])
def health_check() -> tuple[dict[str, str], int]:
    """Health check endpoint for monitoring.

    Returns:
        JSON response with health status and HTTP 200
    """
    return {"status": "healthy", "message": "API is running"}, HTTPStatus.OK


@api_bp.route("/async/<string:job_id>", methods=["GET"])
def async_status(job_id: str) -> tuple[dict[str, str], int]:
    """Look up the current state of a running async job, including the result (if finished)

    Returns:
        JSON response with current status and result (if applicable)
    """
    try:
        result = AsyncResult(job_id)
        if result.state == "SUCCESS":
            return {
                "status": result.status,
                "message": "Completed successfully",
            }, HTTPStatus.OK
        else:
            return {"status": result.status, "message": result.result}, HTTPStatus.OK
    except Exception as e:
        return {
            "status": str(e),
            "message": "Failed to get job status",
        }, HTTPStatus.INTERNAL_SERVER_ERROR


@api_bp.route("/schedules", methods=["GET"])
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


@api_bp.route("/schedule", methods=["GET"])
def get_schedule_404() -> tuple[dict[str, str], int]:
    """
    Helper endpoint to explain why this was a bad request
    :return:
    """
    return {
        "message": "You must include a schedule ID to get schedule status"
    }, HTTPStatus.BAD_REQUEST


@api_bp.route("/schedule", methods=["POST"])
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


@api_bp.route("/schedule/<int:schedule_id>", methods=["GET"])
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


@api_bp.route("/schedule/<int:schedule_id>", methods=["PATCH"])
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


@api_bp.route("/schedule/<int:schedule_id>", methods=["DELETE"])
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


@api_bp.route("/schedule/<int:schedule_id>/trigger", methods=["POST"])
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


@api_bp.route("/notifications", methods=["GET"])
def get_notifications() -> tuple[dict[str, str], int]:
    """
    Retrieves all user-defined notifications
    :return:
        JSON representation of all notifications
    """
    try:
        return (
            {
                "results": current_app.config["MOD_MANAGERS"][
                    "ARMA3"
                ].get_all_notifications(),
                "message": "Retrieved successfully",
            },
            HTTPStatus.OK,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST


@api_bp.route("/notification", methods=["GET"])
def get_notification_404() -> tuple[dict[str, str], int]:
    """
    Helper endpoint to explain why this was a bad request
    :return:
    """
    return {
        "message": "You must include a notification ID to get notification status"
    }, HTTPStatus.BAD_REQUEST


@api_bp.route("/notification", methods=["POST"])
def create_notification() -> tuple[dict[str, str], int]:
    """
    Creates a user-defined notification (which relies on a celery notification)
    Must contain a JSON blob with the fields (you can find them in the model)
    Returns:
        JSON response with health status and HTTP 200
    """
    try:
        created = current_app.config["MOD_MANAGERS"]["ARMA3"].create_notification(
            request.json,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully created", "result": created}, HTTPStatus.OK


@api_bp.route("/notification/<int:notification_id>", methods=["GET"])
def get_notification(notification_id: int) -> tuple[dict[str, str], int]:
    """
    Retrieves information about a specific notification
    Use the URL parameter "include_sensitive" to retrieve sensitive information (defaults to false if missing)
    :return:
        JSON response with details of a single notification
    """
    try:
        created = current_app.config["MOD_MANAGERS"]["ARMA3"].get_notification_details(
            notification_id,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully retrieved", "results": created}, HTTPStatus.OK


@api_bp.route("/notification/<int:notification_id>", methods=["PATCH"])
def update_notification(notification_id: int) -> tuple[dict[str, str], int]:
    """
    Update a single user-defined notification
    :return:
        Status code indicating success or failure
    """
    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].update_notification(
            notification_id,
            request.json,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully updated"}, HTTPStatus.OK


@api_bp.route("/notification/<int:notification_id>", methods=["DELETE"])
def delete_notification(notification_id: int) -> tuple[dict[str, str], int]:
    """
    Delete a single user-defined notification
    :return:
        Status code indicating success or failure
    """
    try:
        current_app.config["MOD_MANAGERS"]["ARMA3"].delete_notification(
            notification_id,
        )
    except Exception as e:
        return {
            "message": str(e),
        }, HTTPStatus.BAD_REQUEST

    return {"message": "Successfully deleted"}, HTTPStatus.OK
