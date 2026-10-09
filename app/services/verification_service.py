
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

    # Determine official job verification status
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

    # Determine company domain
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

    # Prepare job description and ML prediction
    job_description = request.job_description or ""

    ml_probability = None

    if job_description.strip():
        ml_probability = predict_scam_probability(
            job_description
        )

    # -----------------------------------------
    # REASONABLE SCORING SYSTEM
    # -----------------------------------------

    # Start at 60: the job is unverified, not
    # automatically suspicious.
    score = 60.0
    reasons = []

    # 1. Official job verification
    if official_job_match:
        score += 20

        reasons.append(
            "Official Job Verified"
        )

    elif official_job_status == "NOT_FOUND":
        score -= 10

        reasons.append(
            "Official Job Not Found"
        )

    else:
        # An unavailable verification source is
        # not proof that the job is fraudulent.
        reasons.append(
            "Official Job Could Not Be Verified"
        )

    # 2. Company website
    if website_result["exists"]:
        score += 3

        reasons.append(
            "Company Website reachable"
        )
    else:
        score -= 8

        reasons.append(
            "Company Website not reachable"
        )

    # 3. Careers page
    if careers_result["exists"]:
        score += 3

        reasons.append(
            "Official Careers Page reachable"
        )
    else:
        score -= 4

        reasons.append(
            "Official Careers Page not reachable"
        )

    # 4. Database-backed scam indicators
    scam_hits = detect_scam_keywords(
        job_description,
        db
    )

    if scam_hits:
        total_penalty = 0.0

        for hit in scam_hits:
            penalty = float(hit["penalty"])

            # Weak phrases are less conclusive when
            # an official job listing is confirmed.
            if (
                official_job_match
                and hit["severity"] == "weak"
            ):
                penalty *= 0.5

            total_penalty += penalty

        # Reduce the impact of raw penalties and
        # cap their combined effect at -30.
        total_penalty = max(
            total_penalty * 0.7,
            -30
        )

        score += total_penalty

        reasons.append(
            "Scam phrases detected: "
            + ", ".join(
                hit["keyword"]
                for hit in scam_hits
            )
        )

        reasons.append(
            f"Scam indicator score adjustment: "
            f"{total_penalty:.1f}"
        )

    # 5. Recruiter email domain
    email_result = check_email_domain(
        request.recruiter_email,
        website_result["url"]
    )

    if email_result["match"] is True:
        score += 8

        reasons.append(
            email_result["reason"]
        )

    elif email_result["match"] is False:
        score -= 10

        reasons.append(
            email_result["reason"]
        )

    # A missing email-domain result does not affect
    # the score because there is insufficient evidence.

    # 6. ML scam probability
    if ml_probability is not None:
        reasons.append(
            f"ML model predicts scam probability of "
            f"{ml_probability:.2f}"
        )

        if ml_probability >= 0.80:
            score -= 12

            reasons.append(
                "High ML scam risk"
            )

        elif ml_probability >= 0.65:
            score -= 8

            reasons.append(
                "Elevated ML scam risk"
            )

        elif ml_probability >= 0.55:
            score -= 4

            reasons.append(
                "Some ML scam risk detected"
            )

    # Keep the score within 0–100
    score = round(
        max(0, min(100, score))
    )

    # -----------------------------------------
    # VERDICT
    # -----------------------------------------

    if score >= 70:
        verdict = "Likely Genuine"

    elif score >= 40:
        verdict = "Needs Manual Review"

    else:
        verdict = "Suspicious"

    # -----------------------------------------
    # RECOMMENDATION
    # -----------------------------------------

    if verdict == "Likely Genuine":
        recommendation = (
            "The available signals are encouraging. "
            "Verify the recruiter and offer through "
            "the official company website before proceeding."
        )

    elif verdict == "Needs Manual Review":
        recommendation = (
            "Some details remain unverified or inconsistent. "
            "Contact the company through its official website "
            "before sharing sensitive information or proceeding."
        )

    else:
        recommendation = (
            "Significant risk indicators were detected. "
            "Do not pay recruitment fees or share sensitive "
            "personal or financial information."
        )

    # -----------------------------------------
    # SAVE REPORT
    # -----------------------------------------

    db_report = VerificationReport(
        user_id=current_user.id,
        company=request.company,
        job_title=job_title,
        verdict=verdict,
        confidence_score=score,
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
        confidence_score=score,
        ml_scam_probability=db_report.ml_scam_probability,
        verified_at=db_report.created_at,
        signals=VerificationSignals(
            official_job_status=official_job_status,
            website_exists=website_result["exists"],
            career_page_exists=careers_result["exists"],
            career_page_url=careers_result["url"],
            email_matches_domain=email_result["match"],
            scam_indicators_detected=bool(scam_hits)
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
