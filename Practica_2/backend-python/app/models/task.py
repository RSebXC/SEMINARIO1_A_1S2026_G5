
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    title: str
    description: Optional[str] = Field(default=None, sa_column_kwargs={'name': 'description_'})
    is_completed: bool = Field(default=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
