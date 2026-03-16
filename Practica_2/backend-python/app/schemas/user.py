
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    profile_picture_url: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: str
    profile_picture_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
