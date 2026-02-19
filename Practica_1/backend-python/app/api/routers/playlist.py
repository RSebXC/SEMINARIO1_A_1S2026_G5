
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.core.database import get_session
from app.models.user import User
from app.models.playlist import Playlist
from app.models.movie import Movie
from app.api.deps import get_current_user
from app.schemas.playlist import PlaylistCreate, PlaylistResponse

router = APIRouter()

@router.get("/playlist", response_model=PlaylistResponse)
async def list_playlist(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Playlist, Movie).join(Movie).where(Playlist.id_usuario == current_user.id_usuario).order_by(Playlist.fecha_agregada.desc())
    results = session.exec(statement).all()
    
    items = []
    for playlist_item, movie_item in results:
        # Create a flattened dict
        item_dict = movie_item.model_dump()
        item_dict["fecha_agregada"] = playlist_item.fecha_agregada
        items.append(item_dict)
        
    return {"items": items}

@router.post("/playlist", status_code=201)
async def add_to_playlist(
    data: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    movie = session.get(Movie, data.id_pelicula)
    if not movie:
        raise HTTPException(status_code=404, detail="Película no existe")
    if movie.estado != "Disponible":
         raise HTTPException(status_code=400, detail="Película no disponible")
         
    # Check if already in playlist
    statement = select(Playlist).where(
        Playlist.id_usuario == current_user.id_usuario,
        Playlist.id_pelicula == data.id_pelicula
    )
    existing = session.exec(statement).first()
    if existing:
         raise HTTPException(status_code=409, detail="Ya está en tu playlist")
         
    new_item = Playlist(id_usuario=current_user.id_usuario, id_pelicula=data.id_pelicula)
    session.add(new_item)
    session.commit()
    
    return {"message": "Película agregada a playlist"}

@router.delete("/playlist/{id_pelicula}")
async def remove_from_playlist(
    id_pelicula: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(Playlist).where(
        Playlist.id_usuario == current_user.id_usuario,
        Playlist.id_pelicula == id_pelicula
    )
    playlist_item = session.exec(statement).first()
    
    if not playlist_item:
        raise HTTPException(status_code=404, detail="No estaba en playlist")
        
    session.delete(playlist_item)
    session.commit()
    
    return {"message": "Eliminada de playlist"}
