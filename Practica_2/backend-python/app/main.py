
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import auth, tasks, files

app = FastAPI(title="TaskFlow API", version="1.0.0")

# CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(files.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to TaskFlow API - Python Backend"}
