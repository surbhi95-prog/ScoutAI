from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
)

from app.database import Base


class ScamIndicator(Base):
    __tablename__ = "scam_indicators"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String(150), nullable=False)
    pattern = Column(String(500), nullable=False, unique=True)
    severity = Column(String(20), nullable=False)
    penalty = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)