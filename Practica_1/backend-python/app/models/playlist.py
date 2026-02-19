
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Playlist(SQLModel, table=True):
    __tablename__ = "lista_reproduccion"

    id_lista: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuarios.id_usuario")
    id_pelicula: int = Field(foreign_key="peliculas.id_pelicula")
    fecha_agregada: Optional[datetime] = Field(default_factory=datetime.utcnow)
