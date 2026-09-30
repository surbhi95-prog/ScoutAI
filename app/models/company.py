from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, UTC

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    domain: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    ) # airbnb.com

    careers_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    ats_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    ats_identifier: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC)
    )