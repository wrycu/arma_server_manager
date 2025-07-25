"""Background task definitions using Celery."""

import time
from typing import Any

from celery import shared_task
from flask import current_app


@shared_task  # type: ignore[misc]
def example_background_task(duration: int = 5) -> dict[str, Any]:
    """Example background task that simulates work.

    Args:
        duration: Time to sleep in seconds

    Returns:
        Dictionary containing task result information
    """
    current_app.logger.info(f"Starting background task with duration: {duration}s")

    # Simulate some work
    time.sleep(duration)

    result = {
        "status": "completed",
        "duration": duration,
        "message": f"Task completed after {duration} seconds",
    }

    current_app.logger.info("Background task completed successfully")
    return result
