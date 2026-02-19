
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlmodel import Session
from typing import Optional
from app.core.database import get_session
from app.core.security import verify_password
from app.models.user import User
from app.api.deps import get_current_user
from app.services.s3 import upload_file_to_s3, get_s3_client

router = APIRouter()

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {"user": current_user}

@router.put("/profile")
async def update_profile(
    current_password: str = Form(...),
    nombre_completo: Optional[str] = Form(None),
    foto_perfil: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
        
    if nombre_completo:
        current_user.nombre_completo = nombre_completo

    if foto_perfil and get_s3_client():
        uploaded = await upload_file_to_s3(foto_perfil, "Fotos_Perfil")
        current_user.foto_perfil = uploaded["publicUrl"]
        
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {"message": "Perfil actualizado"}
