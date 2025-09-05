# Database Setup Guide

This guide explains how to set up and use the database with Alembic migrations.

## Prerequisites

1. PostgreSQL database running locally or remotely
2. Python dependencies installed: `uv sync`

## Configuration

### Environment Variables

Create a `.env` file in the `src/back/skaut/` directory with your database configuration:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/skaut_db
```

Replace `username`, `password`, `localhost`, `5432`, and `skaut_db` with your actual database credentials.

## Database Setup

### 1. Create Database

First, create the database in PostgreSQL:

```sql
CREATE DATABASE skaut_db;
```

### 2. Initialize Alembic

The Alembic configuration is already set up. To create your first migration:

```bash
cd src/back/skaut
alembic revision --autogenerate -m "Initial migration"
```

### 3. Run Migrations

Apply the migrations to create tables:

```bash
alembic upgrade head
```

### 4. Verify Setup

You can verify the setup by running the initialization script:

```bash
python scripts/init_db.py
```

## Common Alembic Commands

### Create a new migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migrations
```bash
alembic downgrade -1  # Go back one migration
alembic downgrade base  # Go back to the beginning
```

### Check current migration status
```bash
alembic current
alembic history
```

## Database Models

### File Model

The `File` model stores metadata about uploaded files:

- `id`: Primary key
- `original_filename`: Original name of the uploaded file
- `s3_key`: S3 key for the file storage
- `content_type`: MIME type of the file
- `file_size`: Size of the file in bytes
- `extracted_text`: Extracted text content from the file
- `is_converted_to_pdf`: Whether the file has been converted to PDF
- `pdf_s3_key`: S3 key for the PDF version (if converted)
- `created_at`: Timestamp when the record was created
- `updated_at`: Timestamp when the record was last updated

## Using the Database in Your Application

### Async Session (Recommended for FastAPI)

```python
from skaut.database import get_async_db
from skaut.models.files import File

async def create_file(db: AsyncSession, filename: str, s3_key: str):
    file_record = File(
        original_filename=filename,
        s3_key=s3_key,
        content_type="application/pdf"
    )
    db.add(file_record)
    await db.commit()
    await db.refresh(file_record)
    return file_record
```

### Sync Session (For scripts and migrations)

```python
from skaut.database import SessionLocal
from skaut.models.files import File

def create_file_sync(filename: str, s3_key: str):
    db = SessionLocal()
    try:
        file_record = File(
            original_filename=filename,
            s3_key=s3_key,
            content_type="application/pdf"
        )
        db.add(file_record)
        db.commit()
        db.refresh(file_record)
        return file_record
    finally:
        db.close()
```

## Troubleshooting

### Connection Issues

1. Verify your `DATABASE_URL` in the `.env` file
2. Ensure PostgreSQL is running
3. Check that the database exists
4. Verify user permissions

### Migration Issues

1. Check that all models are imported in `alembic/env.py`
2. Ensure the database URL in `alembic.ini` matches your environment
3. Run `alembic current` to check the current migration state

### Common Errors

- **"relation does not exist"**: Run `alembic upgrade head`
- **"target database is not up to date"**: Check migration status with `alembic current`
- **"can't locate revision"**: Check your migration files in `alembic/versions/`
