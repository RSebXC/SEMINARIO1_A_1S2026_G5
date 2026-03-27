
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.file import File
from app.schemas.file import FileCreate, FileRead

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("", status_code=status.HTTP_201_CREATED, response_model=FileRead)
async def create_file(
    file_in: FileCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Guarda la URL del archivo en RDS (el archivo ya está en S3/Blob)"""
    new_file = File(
        user_id=current_user.id,
        file_name=file_in.file_name,
        file_type=file_in.file_type,
        file_url=file_in.file_url
    )
    session.add(new_file)
    session.commit()
    session.refresh(new_file)
    return new_file

@router.get("", response_model=List[FileRead])
async def get_files(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lista todos los archivos del usuario"""
    statement = select(File).where(File.user_id == current_user.id)
    files = session.exec(statement).all()
    return files

@router.get("/{file_id}", response_model=FileRead)
async def get_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Retorna un archivo específico con su URL"""
    statement = select(File).where(File.id == file_id, File.user_id == current_user.id)
    file = session.exec(statement).first()
    if not file:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return file
