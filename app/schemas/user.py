from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel): # for signup
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel): # for login
    email: EmailStr
    password: str