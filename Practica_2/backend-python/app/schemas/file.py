
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class FileCreate(BaseModel):
    file_name: str
    file_type: str
    file_url: str

class FileRead(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_type: str
    file_url: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
