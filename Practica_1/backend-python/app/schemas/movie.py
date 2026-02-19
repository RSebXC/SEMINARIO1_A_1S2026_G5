
from typing import Optional
from pydantic import BaseModel

class MovieBase(BaseModel):
    titulo: str
    director: Optional[str] = None
    anio_estreno: Optional[int] = None
    url_contenido: Optional[str] = None
    poster: Optional[str] = None
    estado: Optional[str] = None  # "Disponible" | "Próximo estreno"

class MovieCreate(MovieBase):
    pass

class MovieUpdate(MovieBase):
    pass

class MovieRead(MovieBase):
    id_pelicula: int

    class Config:
        from_attributes = True
