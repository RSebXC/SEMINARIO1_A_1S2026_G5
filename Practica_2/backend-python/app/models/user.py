
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    profile_picture_url: Optional[str] = Field(default=None)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
