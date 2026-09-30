from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class AdminReportResponse(BaseModel):
    id: int
    user_id: int
    company: str
    job_title: str
    verdict: str
    confidence_score: int
    official_job_status: str | None
    website_exists: bool | None
    email_matches_domain: bool | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )