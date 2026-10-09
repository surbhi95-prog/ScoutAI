
from datetime import date, timedelta
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.verification import VerificationReport
from app.models.scam_indicator import ScamIndicator
from app.schemas.admin import (
    AdminUserResponse,
    AdminReportResponse
)
from app.schemas.scam_indicator import (
    ScamIndicatorCreate,
    ScamIndicatorUpdate,
    ScamIndicatorResponse
)
from app.core.security import require_admin


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    total_users = db.query(func.count(User.id)).scalar()

    total_reports = db.query(
        func.count(VerificationReport.id)
    ).scalar()

    genuine_reports = db.query(
        func.count(VerificationReport.id)
    ).filter(
        VerificationReport.verdict == "Likely Genuine"
    ).scalar()

    suspicious_reports = db.query(
        func.count(VerificationReport.id)
    ).filter(
        VerificationReport.verdict == "Suspicious"
    ).scalar()

    manual_review_reports = db.query(
        func.count(VerificationReport.id)
    ).filter(
        VerificationReport.verdict == "Needs Manual Review"
    ).scalar()

    today = date.today()
    start_date = today - timedelta(days=6)

    daily_counts = (
        db.query(
            func.date(VerificationReport.created_at).label("date"),
            func.count(VerificationReport.id).label("count")
        )
        .filter(
            func.date(VerificationReport.created_at) >= start_date
        )
        .group_by(
            func.date(VerificationReport.created_at)
        )
        .order_by(
            func.date(VerificationReport.created_at)
        )
        .all()
    )

    activity_map = {
        str(row.date): row.count
        for row in daily_counts
    }

    activity = []

    for i in range(7):
        current_date = start_date + timedelta(days=i)

        activity.append({
            "date": str(current_date),
            "count": activity_map.get(str(current_date), 0)
        })

    return {
        "total_users": total_users,
        "total_reports": total_reports,
        "genuine_reports": genuine_reports,
        "suspicious_reports": suspicious_reports,
        "manual_review_reports": manual_review_reports,
        "activity": activity
    }


@router.get(
    "/users",
    response_model=list[AdminUserResponse]
)
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    return db.query(User).all()


@router.get(
    "/reports",
    response_model=list[AdminReportResponse]
)
def get_all_reports(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    return (
        db.query(VerificationReport)
        .order_by(VerificationReport.created_at.desc())
        .all()
    )


@router.delete("/reports/{report_id}")
def delete_admin_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    report = (
        db.query(VerificationReport)
        .filter(VerificationReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    db.delete(report)
    db.commit()

    return {"message": "Report deleted successfully"}


@router.get(
    "/scam-indicators",
    response_model=list[ScamIndicatorResponse]
)
def get_scam_indicators(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    return (
        db.query(ScamIndicator)
        .order_by(ScamIndicator.id)
        .all()
    )


@router.post(
    "/scam-indicators",
    response_model=ScamIndicatorResponse,
    status_code=201
)
def create_scam_indicator(
    data: ScamIndicatorCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    try:
        re.compile(data.pattern)
    except re.error as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid regex pattern: {exc}"
        )

    existing = (
        db.query(ScamIndicator)
        .filter(ScamIndicator.pattern == data.pattern)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This pattern already exists"
        )

    indicator = ScamIndicator(**data.model_dump())

    db.add(indicator)
    db.commit()
    db.refresh(indicator)

    return indicator


@router.put(
    "/scam-indicators/{indicator_id}",
    response_model=ScamIndicatorResponse
)
def update_scam_indicator(
    indicator_id: int,
    data: ScamIndicatorUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    indicator = (
        db.query(ScamIndicator)
        .filter(ScamIndicator.id == indicator_id)
        .first()
    )

    if not indicator:
        raise HTTPException(
            status_code=404,
            detail="Scam indicator not found"
        )

    changes = data.model_dump(exclude_unset=True)

    if "pattern" in changes and changes["pattern"] is not None:
        try:
            re.compile(changes["pattern"])
        except re.error as exc:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid regex pattern: {exc}"
            )

        duplicate = (
            db.query(ScamIndicator)
            .filter(
                ScamIndicator.pattern == changes["pattern"],
                ScamIndicator.id != indicator_id
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=409,
                detail="This pattern already exists"
            )

    for field, value in changes.items():
        setattr(indicator, field, value)

    db.commit()
    db.refresh(indicator)

    return indicator


@router.delete("/scam-indicators/{indicator_id}")
def delete_scam_indicator(
    indicator_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    indicator = (
        db.query(ScamIndicator)
        .filter(ScamIndicator.id == indicator_id)
        .first()
    )

    if not indicator:
        raise HTTPException(
            status_code=404,
            detail="Scam indicator not found"
        )

    db.delete(indicator)
    db.commit()

    return {
        "message": "Scam indicator deleted successfully"
    }
