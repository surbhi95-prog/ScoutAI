from app.services.greenhouse_service import search_greenhouse_job


def search_ats_job(
    ats_type: str,
    ats_identifier: str,
    job_title: str
) -> dict | None:
    if ats_type == "greenhouse":
        return search_greenhouse_job(
            ats_identifier,
            job_title
        )

    return None

#