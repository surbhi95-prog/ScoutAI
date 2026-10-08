from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.models.verification import VerificationReport
from app.core.security import (get_current_user, hash_password,verify_password,create_access_token) # hashing and JWT

router = APIRouter(prefix="/auth",tags=["Authentication"])
@router.post("/signup")
def signup(user:UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return{
        "message":"User Registered Successfully",
        "user_id":new_user.id
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    access_token= create_access_token({
        # We are using existing usesr because Only Logged Users can have Token
        "user_id": existing_user.id,
        "email": existing_user.email,
        "role": existing_user.role
    })
    return {
        "access_token": access_token,
        "token_type":"bearer",
        "user_id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email,
        "role":existing_user.role
    }


# Profile photo get
@router.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_verifications = db.query(
        VerificationReport
    ).filter(
        VerificationReport.user_id == current_user.id
    ).count()

    suspicious_jobs = db.query(
        VerificationReport
    ).filter(
        VerificationReport.user_id == current_user.id,
        VerificationReport.verdict == "Suspicious"
    ).count()

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at,
        "total_verifications": total_verifications,
        "suspicious_jobs": suspicious_jobs
    }


# Profile update req
@router.put("/me")
def update_profile(
    profile: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    name = profile.get("name", "").strip()
    email = profile.get("email", "").strip().lower()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email cannot be empty"
        )

    existing_user = db.query(User).filter(
        User.email == email,
        User.id != current_user.id
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    current_user.name = name
    current_user.email = email

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "name": current_user.name,
        "email": current_user.email
    }