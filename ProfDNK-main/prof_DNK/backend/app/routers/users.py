from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas, auth, models
from ..auth import get_current_admin, get_current_active_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=schemas.UserResponse)
def read_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_me(update_data: schemas.UserUpdate, db: Session = Depends(database.get_db),
              current_user: models.User = Depends(auth.get_current_active_user)):
    if update_data.photo is not None:
        current_user.photo = update_data.photo
    if update_data.bio is not None:
        current_user.bio = update_data.bio
    # email, phone, full_name cannot be changed by psychologist (admin only)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[schemas.UserResponse])
def list_users(skip: int = 0, limit: int = 100,
               db: Session = Depends(database.get_db),
               current_admin: models.User = Depends(get_current_admin)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db),
                current_admin: models.User = Depends(get_current_admin)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        hashed_password=hashed,
        is_admin=user.is_admin,
        access_until=user.access_until,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, update_data: schemas.UserUpdate,
                db: Session = Depends(database.get_db),
                current_admin: models.User = Depends(get_current_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(database.get_db),
                current_admin: models.User = Depends(get_current_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return