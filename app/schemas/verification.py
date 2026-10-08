from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from pydantic import EmailStr

class VerifyJobRequest(BaseModel):
    # id: int = Field
    company: str = Field(..., min_legnth= 2, max_length=100)
    job_title: str = Field(..., min_length=2, max_length=200)
    job_url: str | None = None
    recruiter_email: EmailStr | None = None # automatically rejects invalid emails
    job_description: str | None = None

# add reports to the db - data coming into the API
class VerificationReportCreate(BaseModel): 
    # Field lets us add validation
    # id: MySQL generates it, #created_At: created by server (hence we didn't include it in the schema but it s there in the model)
    company: str = Field(...,min_length=2,max_length=100)
    job_title: str = Field(..., min_length=1, max_length=200)
    verdict: str
    confidence_score: int = Field(..., ge=0, le=100)


# to get all the reports back - DATA goin OUT from API
class VerificationReportResponse(BaseModel):
    id: int
    company : str
    job_title : str
    verdict : str
    confidence_score: int
    created_at : datetime

    model_config = ConfigDict(from_attributes=True)

# structured JSON Schema
class VerificationSignals(BaseModel):
    official_job_status: str
    website_exists: bool
    career_page_exists: bool
    career_page_url: str | None
    email_matches_domain: bool | None
    scam_indicators_detected: bool | None


class VerifyJobResponse(BaseModel):
    company: str
    job_title: str
    verdict: str
    confidence_score: int
    ml_scam_probability: float | None
    verified_at: datetime
    signals: VerificationSignals
    reasons: list[str]
    recommendation: str

#LIST VIEW of HISTORY
class VerificationHistoryItem(BaseModel):
    id: int
    company: str
    job_title: str
    verdict: str
    confidence_score: int
    created_at: datetime

    # Pydantic model config to allow attribute access from SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)

#DETAIL VIEW of HISTORY
class VerificationHistoryDetail(BaseModel):
    id: int
    company: str
    job_title: str
    verdict: str
    confidence_score: int
    ml_scam_probability: float | None

    reasons: str | None

    website_url: str | None
    official_job_url: str | None

    website_exists: bool | None
    email_matches_domain: bool | None
    official_job_status: str 

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# FOR DIRECTLY PASTED MESSAGE
class ExtractJobRequest(BaseModel):
    text: str