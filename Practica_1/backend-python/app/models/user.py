
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    __tablename__ = "usuarios"

    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    nombre_completo: str
    password_hash: str
    foto_perfil: Optional[str] = None
    fecha_registro: Optional[datetime] = Field(default_factory=datetime.utcnow)
