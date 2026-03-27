
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskPatch, TaskRead

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskRead])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Lista todas las tareas del usuario autenticado"""
    statement = select(Task).where(Task.user_id == current_user.id)
    tasks = session.exec(statement).all()
    return tasks

@router.post("", status_code=status.HTTP_201_CREATED, response_model=TaskRead)
async def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Crea una tarea nueva"""
    new_task = Task(
        user_id=current_user.id,
        title=task_in.title,
        description=task_in.description
    )
    session.add(new_task)
    session.commit()
    session.refresh(new_task)
    return new_task

@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Edita título y/o descripción de una tarea"""
    statement = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description

    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.patch("/{task_id}", response_model=TaskRead)
async def toggle_task(
    task_id: int,
    task_in: TaskPatch,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Marca / desmarca una tarea como completada"""
    statement = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    task.is_completed = task_in.is_completed
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Elimina una tarea"""
    statement = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    session.delete(task)
    session.commit()
    return {"message": "Tarea eliminada exitosamente"}
