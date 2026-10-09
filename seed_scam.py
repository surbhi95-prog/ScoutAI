from app.database import SessionLocal
from app.models.scam_indicator import ScamIndicator


INITIAL_INDICATORS = [
    (
        "registration fee",
        r"registration\s+fee",
        -40,
        "strong",
    ),
    (
        "processing fee",
        r"processing\s+fee",
        -40,
        "strong",
    ),
    (
        "training fee",
        r"training\s+fee",
        -35,
        "strong",
    ),
    (
        "pay before interview",
        r"pay\s+before\s+interview",
        -50,
        "strong",
    ),
    (
        "security deposit",
        r"security\s+deposit",
        -35,
        "strong",
    ),
    (
        "telegram interview",
        r"telegram\s+interview",
        -15,
        "medium",
    ),
    (
        "whatsapp interview",
        r"whatsapp\s+interview",
        -15,
        "medium",
    ),
    (
        "urgent hiring",
        r"urgent\s+(hiring|joining|joinee|joiner|requirement)",
        -5,
        "weak",
    ),
    (
        "immediate joining",
        r"immediate\s+(joiner|joining|joinee)",
        -5,
        "weak",
    ),
    (
        "limited seats",
        r"limited\s+seats?",
        -5,
        "weak",
    ),
]


def seed_indicators():
    db = SessionLocal()

    try:
        for keyword, pattern, penalty, severity in INITIAL_INDICATORS:
            existing = (
                db.query(ScamIndicator)
                .filter(ScamIndicator.pattern == pattern)
                .first()
            )

            if not existing:
                db.add(
                    ScamIndicator(
                        keyword=keyword,
                        pattern=pattern,
                        penalty=penalty,
                        severity=severity,
                        is_active=True,
                    )
                )

        db.commit()
        print("Scam indicators seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_indicators()