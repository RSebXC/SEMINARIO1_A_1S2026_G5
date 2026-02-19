
from typing import Optional
from sqlmodel import SQLModel, Field

class Movie(SQLModel, table=True):
    __tablename__ = "peliculas"

    id_pelicula: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    director: Optional[str] = None
    anio_estreno: Optional[int] = None
    url_contenido: Optional[str] = None
    poster: Optional[str] = None
    estado: Optional[str] = None  # "Disponible" | "Próximo estreno"
