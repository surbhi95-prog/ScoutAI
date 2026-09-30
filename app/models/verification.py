from sqlalchemy import String, Integer, DateTime, Text, Boolean # importing datatypes from the sqlalchemy
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship # to map a colm to mysql
from datetime import datetime, UTC # date dtype

from app.database import Base # this is the parent class which every class must extend otherwise it is not recognised as ...


class VerificationReport(Base):
    __tablename__ = 'verification_reports'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # ---------- HERE IS OUT FOERIGN KEYY
    user_id: Mapped[int] = mapped_column(
            ForeignKey("users.id"),
            nullable=False
        )
    user = relationship(
        "User",
        back_populates="verification_reports"
    )
    company: Mapped[str] = mapped_column(String(100))
    job_title: Mapped[str] = mapped_column(String(200))

    verdict: Mapped[str] = mapped_column(String(50))
    confidence_score: Mapped[int] = mapped_column(Integer)

    ml_scam_probability: Mapped[float | None] = mapped_column(nullable=True)

    # Evidence fields
    reasons: Mapped[str | None] = mapped_column(Text, nullable=True)

    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    official_job_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    website_exists: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    email_matches_domain: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    official_job_status: Mapped[str | None] = mapped_column(
    String(30),
    nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC)
    )