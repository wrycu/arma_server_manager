FROM python:3.11-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install --upgrade pip uv

# Copy only dependency files first for better caching
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies directly into system Python (avoiding venv issues)
RUN uv export --format requirements-txt --no-dev > requirements.txt && \
    pip install -r requirements.txt

# Copy application source
COPY backend/ ./

ENV FLASK_APP=main.py
ENV FLASK_RUN_PORT=5000
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["python", "main.py"]


