from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.verification import VerificationReport

from app.schemas.verification import (
    VerificationReportCreate,
    VerifyJobRequest,
    VerifyJobResponse,
    VerificationSignals
)

from app.services.ats_service import search_ats_job
from app.services.domain_service import check_company_domain
from app.services.scam_service import detect_scam_keywords
from app.services.email_service import check_email_domain
from app.services.ml_service import predict_scam_probability
from app.services.company_service import get_company_by_name
from app.services.careers_service import check_careers_page
from app.services.official_job_service import search_official_job


def create_verification_report(
    report: VerificationReportCreate,
    db: Session,
    current_user
):
    db_report = VerificationReport(
        user_id=current_user.id,
        company=report.company,
        job_title=report.job_title,
        verdict=report.verdict,
        confidence_score=report.confidence_score
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return db_report


def get_all_reports(
    db: Session,
    current_user
):
    return (
        db.query(VerificationReport)
        .filter(
            VerificationReport.user_id == current_user.id
        )
        .all()
    )


def verify_job(
    request: VerifyJobRequest,
    db: Session,
    current_user
):
    job_title = request.job_title.strip()

    company = get_company_by_name(
        db,
        request.company
    )

    official_job_match = None
    official_job_result = None
    discovered_careers_url = None

    ats_configured = bool(
        company
        and company.ats_type
        and company.ats_identifier
    )

    if ats_configured:
        official_job_match = search_ats_job(
            company.ats_type,
            company.ats_identifier,
            job_title
        )

    else:
        official_job_result = search_official_job(
            request.company,
            job_title
        )

        discovered_careers_url = (
            official_job_result.get("careers_url")
        )

        if official_job_result.get("found"):
            official_job_match = {
                "url": official_job_result.get("url"),
                "title": official_job_result.get("title"),
                "match_score": official_job_result.get(
                    "match_score"
                )
            }

    if official_job_match:
        official_job_status = "VERIFIED"

    elif ats_configured:
        official_job_status = "NOT_FOUND"

    elif official_job_result is not None:
        if official_job_result.get("careers_domain"):
            official_job_status = "NOT_FOUND"
        else:
            official_job_status = "UNABLE_TO_VERIFY"

    else:
        official_job_status = "UNABLE_TO_VERIFY"

    if company:
        domain_to_check = company.domain
    else:
        domain_to_check = (
            official_job_result.get("careers_domain")
            if official_job_result
            else None
        )

        if not domain_to_check:
            domain_to_check = request.company

    website_result = check_company_domain(
        domain_to_check
    )

    if company:
        careers_url = company.careers_url
    else:
        careers_url = discovered_careers_url

    careers_result = check_careers_page(
        careers_url
    )

    score = 0
    reasons = []
    ml_probability = None

    job_description = (
        request.job_description
        or ""
    )

    if job_description.strip():
        ml_probability = predict_scam_probability(
            job_description
        )

    if ats_configured:
        if official_job_match:
            score += 60
            reasons.append(
                "Official ATS Job Verified"
            )
        else:
            reasons.append(
                "Official ATS Job Not Found"
            )

    elif official_job_match:
        score += 60
        reasons.append(
            "Official Job Verified"
        )

    elif official_job_result is not None:
        if official_job_result.get("careers_domain"):
            reasons.append(
                "Official Job Not Found"
            )
        else:
            reasons.append(
                "Official Job Could Not Be Verified"
            )

    else:
        reasons.append(
            "Official Job Could Not Be Verified"
        )

    if website_result["exists"]:
        score += 20
        reasons.append(
            "Company Website reachable"
        )

    else:
        reasons.append(
            "Company Website not reachable"
        )

    if careers_result["exists"]:
        score += 10
        reasons.append(
            "Official Careers Page reachable"
        )

    else:
        reasons.append(
            "Official Careers Page not reachable"
        )

    scam_hits = detect_scam_keywords(
        job_description
    )

    if scam_hits:
        total_penalty = 0

        for hit in scam_hits:
            penalty = hit["penalty"]

            if official_job_match:
                if hit["severity"] == "weak":
                    penalty *= 0.3

                elif hit["severity"] == "medium":
                    penalty *= 0.7

            total_penalty += penalty

        total_penalty = max(
            total_penalty,
            -40
        )

        score += total_penalty

        reasons.append(
            "Scam phrases detected: "
            + ", ".join(
                hit["keyword"]
                for hit in scam_hits
            )
        )

    email_result = check_email_domain(
        request.recruiter_email,
        website_result["url"]
    )

    if email_result["match"] is True:
        score += 20

        reasons.append(
            email_result["reason"]
        )

    elif email_result["match"] is False:
        score -= 25

        reasons.append(
            email_result["reason"]
        )

    if ml_probability is not None:
        reasons.append(
            f"ML model predicts scam probability of "
            f"{ml_probability:.2f}"
        )

        if ml_probability >= 0.80:
            score -= 20

        elif ml_probability >= 0.60:
            score -= 10

        elif ml_probability >= 0.40:
            score -= 5

    score = max(
        0,
        min(100, score)
    )

    if score >= 60:
        verdict = "Likely Genuine"

    elif score >= 25:
        verdict = "Needs Manual Review"

    else:
        verdict = "Suspicious"

    if verdict == "Likely Genuine":
        recommendation = (
            "Proceed with caution; verify the offer "
            "through the official company website."
        )

    elif verdict == "Needs Manual Review":
        recommendation = (
            "Do not proceed until the job and recruiter "
            "are manually verified."
        )

    else:
        recommendation = (
            "Avoid sharing personal information "
            "or making payments."
        )

    db_report = VerificationReport(
        user_id=current_user.id,
        company=request.company,
        job_title=job_title,
        verdict=verdict,
        confidence_score=int(score),
        ml_scam_probability=ml_probability,
        reasons=" | ".join(reasons),
        website_url=website_result["url"],
        official_job_url=(
            official_job_match["url"]
            if official_job_match
            else None
        ),
        website_exists=website_result["exists"],
        email_matches_domain=email_result["match"],
        official_job_status=official_job_status
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return VerifyJobResponse(
        company=db_report.company,
        job_title=db_report.job_title,
        verdict=db_report.verdict,
        confidence_score=int(
            db_report.confidence_score
        ),
        ml_scam_probability=(
            db_report.ml_scam_probability
        ),
        verified_at=db_report.created_at,
        signals=VerificationSignals(
            official_job_status=official_job_status,
            website_exists=website_result["exists"],
            career_page_exists=careers_result["exists"],
            career_page_url=careers_result["url"],
            email_matches_domain=email_result["match"],
            scam_indicators_detected=bool(
                scam_hits
            )
        ),
        reasons=reasons,
        recommendation=recommendation
    )


def get_verification_history(
    db: Session,
    current_user
):
    return (
        db.query(VerificationReport)
        .filter(
            VerificationReport.user_id == current_user.id
        )
        .order_by(
            VerificationReport.created_at.desc()
        )
        .all()
    )


def clear_verification_history(
    db: Session,
    current_user
):
    db.query(VerificationReport).filter(
        VerificationReport.user_id == current_user.id
    ).delete()

    db.commit()

    return {
        "message": "History cleared Successfully"
    }


def delete_verification_report(
    report_id: int,
    db: Session,
    current_user
):
    report = (
        db.query(VerificationReport)
        .filter(
            VerificationReport.id == report_id,
            VerificationReport.user_id == current_user.id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    db.delete(report)
    db.commit()

    return {
        "message": "Report deleted successfully"
    }


def get_verification_by_id(
    report_id: int,
    db: Session,
    current_user
):
    report = (
        db.query(VerificationReport)
        .filter(
            VerificationReport.user_id == current_user.id,
            VerificationReport.id == report_id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return report