
from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict # Or a UserRead schema to be more specific

class TokenData(BaseModel):
    email: Optional[str] = None
    id_usuario: Optional[int] = None

class Message(BaseModel):
    message: str
