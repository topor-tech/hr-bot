"""File model for storing file metadata."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, Integer, String, UUID
from sqlalchemy.sql import func

from .base import Base


class File(Base):
    """Model for storing file metadata and information."""
    
    __tablename__ = "file"
    
    id = Column(Integer, primary_key=True, index=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    original_filename = Column(String(255), nullable=False)
    extension = Column(String(10), nullable=False)
    s3_key = Column(UUID, nullable=False)
    content_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)
    