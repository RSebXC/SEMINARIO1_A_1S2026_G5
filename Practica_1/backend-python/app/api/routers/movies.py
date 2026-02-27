
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.movie import Movie

router = APIRouter()

@router.get("/movies", response_model=dict)
async def list_movies(session: Session = Depends(get_session)):
    statement = select(Movie).order_by(Movie.id_pelicula.desc())
    movies = session.exec(statement).all()
    return {"items": movies}
