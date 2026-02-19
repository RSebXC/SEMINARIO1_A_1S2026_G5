
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    nombre_completo: str

class UserCreate(UserBase):
    password: str
    confirm_password: str

class UserUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    current_password: str 

class UserRead(UserBase):
    id_usuario: int
    foto_perfil: Optional[str] = None
    fecha_registro: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
