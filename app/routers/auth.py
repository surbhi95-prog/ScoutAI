from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import (hash_password,verify_password,create_access_token) # hashing and JWT

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