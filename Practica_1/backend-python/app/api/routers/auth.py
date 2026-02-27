
from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlmodel import Session, select
from typing import Optional

from app.core.database import get_session
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserLogin
from app.services.s3 import upload_file_to_s3, get_s3_client

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    email: str = Form(...),
    nombre_completo: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    foto_perfil: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session)
):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Contraseñas no coinciden")
    
    statement = select(User).where(User.email == email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="El correo ya está registrado")

    # Upload to S3 if configured, otherwise foto_perfil stays None
    foto_url = None
    if foto_perfil and get_s3_client():
        uploaded = await upload_file_to_s3(foto_perfil, "Fotos_Perfil")
        foto_url = uploaded["publicUrl"]

    new_user = User(
        email=email,
        nombre_completo=nombre_completo,
        password_hash=get_password_hash(password),
        foto_perfil=foto_url
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return {
        "message": "Usuario registrado",
        "id_usuario": new_user.id_usuario,
        "foto_perfil": new_user.foto_perfil
    }

@router.post("/login")
async def login(user_in: UserLogin, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user_in.email)
    user = session.exec(statement).first()
    
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
    access_token = create_access_token(data={"sub": user.email, "email": user.email, "id_usuario": user.id_usuario})
    
    return {
        "message": "Login exitoso",
        "access_token": access_token,
        "token_type": "bearer"
    }
