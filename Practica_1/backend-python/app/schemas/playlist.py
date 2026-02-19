
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.movie import MovieRead

class PlaylistBase(BaseModel):
    id_pelicula: int

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistReadItem(BaseModel):
    id_pelicula: int
    fecha_agregada: datetime
    titulo: str
    director: Optional[str]
    anio_estreno: Optional[int]
    url_contenido: Optional[str]
    poster: Optional[str]
    estado: str

    class Config:
        from_attributes = True

class PlaylistResponse(BaseModel):
    items: List[PlaylistReadItem]

class PlaylistAddResponse(BaseModel):
    message: str
