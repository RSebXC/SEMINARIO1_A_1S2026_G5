
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class File(SQLModel, table=True):
    __tablename__ = "files"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    file_name: str
    file_type: str
    file_url: str
    uploaded_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
