#!/usr/bin/env python3
"""Initialize database and run migrations."""

import asyncio
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy import create_engine
from skaut.config import settings
from skaut.orm.base import Base


def create_tables():
    """Create all tables in the database."""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


if __name__ == "__main__":
    print("🚀 Initializing database...")
    create_tables()
    print("🎉 Database initialization complete!")
