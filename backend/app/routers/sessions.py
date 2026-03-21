from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas, models, auth

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

@router.get("/test/{test_id}", response_model=List[schemas.TestSessionResponse])
def list_sessions(test_id: int, db: Session = Depends(database.get_db),
                  current_user: models.User = Depends(auth.get_current_active_user)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.owner_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    sessions = db.query(models.TestSession).filter(models.TestSession.test_id == test_id).all()
    return sessions

@router.get("/{session_id}", response_model=schemas.TestSessionResponse)
def get_session(session_id: int, db: Session = Depends(database.get_db),
                current_user: models.User = Depends(auth.get_current_active_user)):
    session = db.query(models.TestSession).filter(models.TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    test = db.query(models.Test).filter(models.Test.id == session.test_id).first()
    if test.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your test")
    return session