"""Interview script model for storing interview scripts."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class InterviewScript(Base):
    """Model for storing interview scripts."""
    
    __tablename__ = "interview_script"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    vacancy_id = Column(Integer, ForeignKey("vacancy.id"), nullable=False)
    script = Column(JSON, nullable=False)
    