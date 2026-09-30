from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyCreate(BaseModel):
    name: str
    domain: str
    careers_url: str | None = None
    ats_type: str
    ats_identifier: str | None = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    domain: str
    careers_url: str | None
    ats_type: str
    ats_identifier: str | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class AdminCompanyCreate(BaseModel):
    name: str
    domain: str
    careers_url: str | None = None
    ats_type: str
    ats_identifier: str | None = None
    is_active: bool = True


class AdminCompanyUpdate(BaseModel):
    name: str
    domain: str
    careers_url: str | None = None
    ats_type: str
    ats_identifier: str | None = None
    is_active: bool


class AdminCompanyResponse(BaseModel):
    id: int
    name: str
    domain: str
    careers_url: str | None
    ats_type: str
    ats_identifier: str | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
