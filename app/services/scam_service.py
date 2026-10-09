import re

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.scam_indicator import ScamIndicator

def detect_scam_keywords(
    text: str | None,
    db: Session
):
    if not text:
        return []

    text_lower = text.lower()

    indicators = (
        db.query(ScamIndicator)
        .filter(ScamIndicator.is_active.is_(True))
        .all()
    )

    found = []

    for indicator in indicators:
        try:
            match = re.search(
                indicator.pattern,
                text_lower
            )
        except re.error:
            continue

        if match:
            found.append({
                "keyword": match.group(0),
                "penalty": indicator.penalty,
                "severity": indicator.severity
            })

    return found