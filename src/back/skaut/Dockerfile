# Use Python 3.12 slim image as base
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install uv (Python package manager)
RUN pip install uv

# Set work directory
WORKDIR /app

# Copy pyproject.toml and uv.lock for dependency installation
COPY pyproject.toml README.md ./

# Install dependencies using uv
RUN uv pip compile pyproject.toml --output-file requirements.txt
RUN uv pip install -r requirements.txt --system

# Copy the skaut directory
COPY skaut/ ./skaut/

# Copy the alembic directory
COPY alembic/ ./alembic/

# Copy alembic.ini configuration
COPY alembic.ini ./

# Run the application
CMD ["python", "-m", "uvicorn", "skaut.app:app", "--host", "0.0.0.0", "--port", "8001", "--log-level", "debug"]
