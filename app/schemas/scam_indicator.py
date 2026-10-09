from pydantic import BaseModel, ConfigDict, Field
from typing import Literal


class ScamIndicatorCreate(BaseModel):
    keyword: str = Field(min_length=1, max_length=150)
    pattern: str = Field(min_length=1, max_length=500)
    severity: Literal["weak", "medium", "strong"]
    penalty: int = Field(ge=-100, le=0)
    is_active: bool = True


class ScamIndicatorUpdate(BaseModel):
    keyword: str | None = Field(default=None, min_length=1, max_length=150)
    pattern: str | None = Field(default=None, min_length=1, max_length=500)
    severity: Literal["weak", "medium", "strong"] | None = None
    penalty: int | None = Field(default=None, ge=-100, le=0)
    is_active: bool | None = None


class ScamIndicatorResponse(ScamIndicatorCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)