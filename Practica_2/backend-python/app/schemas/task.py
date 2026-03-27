
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class TaskPatch(BaseModel):
    is_completed: bool

class TaskRead(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
