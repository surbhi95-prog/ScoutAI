# Password hashing ...
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

# 1st hash the password
def hash_password(password: str) -> str:
    return password_hash.hash(password)

# then verify password and hashedpassword -> bekz thats how we are going to authenticate users
def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)

# JWT Import helper
import jwt
from datetime import datetime, timedelta,UTC

SECRET_KEY = "my-scret-key"
ALGORITHM = "HS256"
def create_access_token(data:dict, expires_minutes:int = 60):
    to_encode = data.copy()

    expire = datetime.now(UTC) + timedelta(minutes=expires_minutes)

    to_encode.update({
        "exp":expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

# get_current_user()
from fastapi import Depends,HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

security = HTTPBearer()

def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security), 
        db: Session = Depends(get_db)): # Find the user by whom current req is made
    
    token = credentials.credentials # accesss his Credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        ) # decode the token from the credentials

        user_id = payload.get("user_id") # identify the user_id from the credentials

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid Token"
            ) # if no user_id present --> raise an exception
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        ) # Check if token has expired
    
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        ) # Check if token matched with any...

    # --------- Find the user in the db by user_id
    user = db.query(User).filter(
        User.id == user_id
    ).first() 

    if user is None: # If no such user found in the db... raise exception
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    return user

# extract the token, decode jwt -> signature + expiry check -> user_id searched in the db -> returns the current user

def require_admin(current_user: User  = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin acsess required"
        )
    return current_user