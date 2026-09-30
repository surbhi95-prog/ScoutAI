from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.company import Company

from app.schemas.company import (
    AdminCompanyCreate,
    AdminCompanyUpdate,
    AdminCompanyResponse
)

from app.core.security import require_admin


router = APIRouter(
    prefix="/admin/companies",
    tags=["Admin Companies"]
)


@router.get(
    "",
    response_model=list[AdminCompanyResponse]
)
def get_companies(
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin)
):
    companies = (
        db.query(Company)
        .order_by(Company.name.asc())
        .all()
    )

    return companies


@router.post(
    "",
    response_model=AdminCompanyResponse
)
def add_company(
    company: AdminCompanyCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin)
):
    existing_name = (
        db.query(Company)
        .filter(
            Company.name.ilike(company.name.strip())
        )
        .first()
    )

    if existing_name:
        raise HTTPException(
            status_code=400,
            detail="Company name already exists"
        )

    existing_domain = (
        db.query(Company)
        .filter(
            Company.domain.ilike(company.domain.strip())
        )
        .first()
    )

    if existing_domain:
        raise HTTPException(
            status_code=400,
            detail="Company domain already exists"
        )

    new_company = Company(
        name=company.name.strip(),
        domain=company.domain.strip(),
        careers_url=company.careers_url,
        ats_type=company.ats_type,
        ats_identifier=company.ats_identifier,
        is_active=company.is_active
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


@router.put(
    "/{company_id}",
    response_model=AdminCompanyResponse
)
def update_company(
    company_id: int,
    company: AdminCompanyUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin)
):
    existing_company = (
        db.query(Company)
        .filter(
            Company.id == company_id
        )
        .first()
    )

    if not existing_company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    duplicate_name = (
        db.query(Company)
        .filter(
            Company.name.ilike(company.name.strip()),
            Company.id != company_id
        )
        .first()
    )

    if duplicate_name:
        raise HTTPException(
            status_code=400,
            detail="Company name already exists"
        )

    duplicate_domain = (
        db.query(Company)
        .filter(
            Company.domain.ilike(company.domain.strip()),
            Company.id != company_id
        )
        .first()
    )

    if duplicate_domain:
        raise HTTPException(
            status_code=400,
            detail="Company domain already exists"
        )

    existing_company.name = company.name.strip()
    existing_company.domain = company.domain.strip()
    existing_company.careers_url = company.careers_url
    existing_company.ats_type = company.ats_type
    existing_company.ats_identifier = company.ats_identifier
    existing_company.is_active = company.is_active

    db.commit()
    db.refresh(existing_company)

    return existing_company
