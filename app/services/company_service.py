# 
from sqlalchemy.orm import Session
from app.models.company import Company


def get_company_by_name(
    db: Session,
    name: str
) -> Company | None:
    return db.query(Company).filter(
        Company.name.ilike(name)
    ).first()