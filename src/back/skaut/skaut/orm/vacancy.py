"""Vacancy model for storing job vacancy information."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class Vacancy(Base):
    """Model for storing job vacancy information."""
    
    __tablename__ = "vacancy"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    file_id = Column(Integer, ForeignKey("file.id"), nullable=True)
    pdf_file_id = Column(Integer, ForeignKey("file.id"), nullable=True)
    extracted_text = Column(Text, nullable=True)
    tags = Column(ARRAY(String), nullable=True, index=True)
