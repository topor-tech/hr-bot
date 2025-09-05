"""CV model for storing CV/resume information."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, ForeignKey, Text, String
from sqlalchemy.sql import func

from .base import Base


class CV(Base):
    """Model for storing CV/resume information."""
    
    __tablename__ = "cv"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    file_id = Column(Integer, ForeignKey("file.id"), nullable=False)
    pdf_file_id = Column(Integer, ForeignKey("file.id"), nullable=True)
    extracted_text = Column(Text, nullable=True)
