"""Interview model for storing interview information."""

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class InterviewDecision(str, Enum):
    """Enum for interview decision values."""
    DENY = "deny"
    HIRE = "hire"
    NEED_MORE_INFO = "need more info"


class Interview(Base):
    """Model for storing interview information."""
    
    __tablename__ = "interview"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    vacancy_id = Column(Integer, ForeignKey("vacancy.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("cv.id"), nullable=False)
    customized_script = Column(JSON, nullable=True)
    planned_datetime = Column(DateTime(timezone=True), nullable=True)
    result_info = Column(JSON, nullable=False)
    decision = Column(SQLEnum(InterviewDecision), nullable=False)

