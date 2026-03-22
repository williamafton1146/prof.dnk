from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, PsychologistProfile
from app.schemas import PsychologistProfileIn, PsychologistProfileOut, UserPublic
from app.security import get_current_user
import os
from datetime import date

router = APIRouter(prefix="/me", tags=["me"])

@router.get("/", response_model=UserPublic)
def read_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user

@router.patch("/profile", response_model=PsychologistProfileOut)
def update_my_profile(profile_in: PsychologistProfileIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "psychologist":
        raise HTTPException(status_code=403, detail="Only psychologists can manage profiles.")

    profile = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    if not profile:
        # Create profile if it doesn't exist
        profile = PsychologistProfile(user_id=current_user.id, **profile_in.dict(exclude_unset=True))
        db.add(profile)
    else:
        # Update existing profile
        for key, value in profile_in.dict(exclude_unset=True).items():
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.post("/profile/avatar", response_model=PsychologistProfileOut)
async def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "psychologist":
        raise HTTPException(status_code=403, detail="Only psychologists can manage profiles.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    filename = f"{current_user.id}_{file.filename}"
    filepath = os.path.join("static", "uploads", filename)

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())

    avatar_path = f"/static/uploads/{filename}"

    profile = db.query(PsychologistProfile).filter(PsychologistProfile.user_id == current_user.id).first()
    if not profile:
        profile = PsychologistProfile(user_id=current_user.id, avatar_url=avatar_path)
        db.add(profile)
    else:
        profile.avatar_url = avatar_path

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/access-info")
def get_access_info(current_user: User = Depends(get_current_user)):
    return {
        "access_until": current_user.access_until.isoformat() if current_user.access_until else None,
        "is_active": current_user.is_active,
        "role": current_user.role
    }