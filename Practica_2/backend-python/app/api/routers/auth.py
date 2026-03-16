
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserRead

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, session: Session = Depends(get_session)):
    # Check if username already exists
    statement = select(User).where(User.username == user_in.username)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="El nombre de usuario ya está registrado")

    # Check if email already exists
    statement = select(User).where(User.email == user_in.email)
    existing_email = session.exec(statement).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="El correo electrónico ya está registrado")

    # Create new user
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        profile_picture_url=user_in.profile_picture_url
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {
        "message": "Usuario registrado exitosamente",
        "user": UserRead.model_validate(new_user)
    }

@router.post("/login")
async def login(user_in: UserLogin, session: Session = Depends(get_session)):
    # Find user by username
    statement = select(User).where(User.username == user_in.username)
    user = session.exec(statement).first()

    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # Generate token
    access_token = create_access_token(data={
        "sub": user.username,
        "username": user.username,
        "id": user.id
    })

    return {
        "user": UserRead.model_validate(user),
        "token": access_token
    }
