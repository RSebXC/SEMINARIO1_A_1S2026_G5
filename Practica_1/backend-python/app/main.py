
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import auth, movies, playlist, profile

app = FastAPI(title="CloudCinema API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, tags=["Auth"])
app.include_router(movies.router, tags=["Movies"])
app.include_router(playlist.router, tags=["Playlist"])
app.include_router(profile.router, tags=["Profile"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CloudCinema API with FastAPI"}
