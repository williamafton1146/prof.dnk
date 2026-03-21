from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, schemas, auth, models
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}