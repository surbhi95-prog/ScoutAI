from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db 
from app.schemas.verification import (VerificationReportCreate, VerificationReportResponse, VerifyJobRequest) # validates incoming json
from app.schemas.verification import (VerificationSignals,VerifyJobResponse)
from app.schemas.verification import (VerificationHistoryItem, VerificationHistoryDetail)
# for directly pasted input
from app.schemas.verification import ExtractJobRequest

from app.services.verification_service import (create_verification_report,get_all_reports, verify_job)

# Clear history service
from app.services.verification_service import (get_verification_history,get_verification_by_id,clear_verification_history,delete_verification_report)

# Including jwt with requests
from app.core.security import get_current_user
from app.models.user import User

# extractor 
from app.services.job_extractor import extract_job

router = APIRouter()

# Depends - FastAPI automatically:

# opens the session, - db convo we'll use to insert & fetch records
# gives it to the endpoint,
# closes it after the request finishes.
@router.post("/reports")
def create_report(report: VerificationReportCreate,
                   db: Session = Depends(get_db),
                   current_user:User = Depends(get_current_user)):
    return create_verification_report(report,db,current_user) # here db means we are using the same session from which the req cam to us
    # we convert it into SQLAlch mode bekz the req's data is pydantic obj
    # and we cannot save it in the db w/o converting it to the model

@router.get('/reports')
def list_reports(db: Session = Depends(get_db),
                 current_user:User = Depends(get_current_user)
        ):
    return get_all_reports(db,current_user)

@router.post('/verify-job',response_model = VerifyJobResponse) # follow this model for displaying data TO frontend
def verify_job_endpoint(
    request: VerifyJobRequest,
    db:Session = Depends(get_db),
    current_user:User = Depends(get_current_user)
    ):
    return verify_job(request,db,current_user)

@router.get('/history',response_model=list[VerificationHistoryItem])
def history(db:Session = Depends(get_db),
            current_user:User = Depends(get_current_user)):
    return get_verification_history(db,current_user)

@router.delete('/history')
def clear_history(db:Session = Depends(get_db),
                  current_user:User = Depends(get_current_user)):
    return clear_verification_history(db,current_user)
@router.delete('/history/{report_id}')

def delete_report(report_id:int,
                  db:Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    return delete_verification_report(report_id,db,current_user)

@router.get('/history/{report_id}',response_model=VerificationHistoryDetail)
def history_detail(
    report_id:int,
    db:Session = Depends(get_db),
    current_user:User = Depends(get_current_user)
    ):
    return get_verification_by_id(report_id,db,current_user)

# EXTRACTOR
@router.post("/extract-job")
def extract_job_endpoint(request: ExtractJobRequest):
    return extract_job(request.text)