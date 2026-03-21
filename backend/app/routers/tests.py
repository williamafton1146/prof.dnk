import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from .. import database, schemas, auth, models
from ..auth import get_current_active_user

router = APIRouter(prefix="/api/tests", tags=["tests"])

def generate_public_uuid():
    return str(uuid.uuid4())

@router.post("/", response_model=schemas.TestResponse)
def create_test(test_data: schemas.TestCreate, db: Session = Depends(database.get_db),
                current_user: models.User = Depends(get_current_active_user)):
    # check access expiration
    if current_user.access_until and current_user.access_until < func.now():
        raise HTTPException(status_code=403, detail="Access expired")
    public_uuid = generate_public_uuid()
    db_test = models.Test(
        title=test_data.title,
        description=test_data.description,
        public_uuid=public_uuid,
        config=test_data.config.dict(),
        owner_id=current_user.id
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

@router.get("/", response_model=List[schemas.TestResponse])
def list_my_tests(skip: int = 0, limit: int = 100,
                  db: Session = Depends(database.get_db),
                  current_user: models.User = Depends(get_current_active_user)):
    tests = db.query(models.Test).filter(models.Test.owner_id == current_user.id)\
        .offset(skip).limit(limit).all()
    result = []
    for t in tests:
        sessions_count = db.query(models.TestSession).filter(models.TestSession.test_id == t.id).count()
        last_session = db.query(models.TestSession).filter(models.TestSession.test_id == t.id)\
            .order_by(models.TestSession.completed_at.desc()).first()
        result.append({
            **t.__dict__,
            "sessions_count": sessions_count,
            "last_session_at": last_session.completed_at if last_session else None
        })
    return result

@router.get("/{test_id}", response_model=schemas.TestResponse)
def get_test(test_id: int, db: Session = Depends(database.get_db),
             current_user: models.User = Depends(get_current_active_user)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.owner_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    sessions_count = db.query(models.TestSession).filter(models.TestSession.test_id == test.id).count()
    last_session = db.query(models.TestSession).filter(models.TestSession.test_id == test.id)\
        .order_by(models.TestSession.completed_at.desc()).first()
    return {
        **test.__dict__,
        "sessions_count": sessions_count,
        "last_session_at": last_session.completed_at if last_session else None
    }

@router.put("/{test_id}", response_model=schemas.TestResponse)
def update_test(test_id: int, update_data: schemas.TestUpdate,
                db: Session = Depends(database.get_db),
                current_user: models.User = Depends(get_current_active_user)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.owner_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    if update_data.title is not None:
        test.title = update_data.title
    if update_data.description is not None:
        test.description = update_data.description
    if update_data.config is not None:
        test.config = update_data.config.dict()
    db.commit()
    db.refresh(test)
    return test

@router.delete("/{test_id}", status_code=204)
def delete_test(test_id: int, db: Session = Depends(database.get_db),
                current_user: models.User = Depends(get_current_active_user)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.owner_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    db.delete(test)
    db.commit()
    return

@router.get("/{test_id}/link")
def get_test_link(test_id: int, db: Session = Depends(database.get_db),
                  current_user: models.User = Depends(get_current_active_user)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.owner_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    # return full URL (frontend will prepend base URL)
    return {"link": f"/test/{test.public_uuid}"}

@router.post("/{test_id}/import")
def import_test_config(test_id: int, config: schemas.TestConfig,
                       db: Session = Depends(database.get_db),
                       current_user: models.User = Depends(get_current_active_user)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.owner_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    test.config = config.dict()
    db.commit()
    return {"status": "ok"}

@router.get("/{test_id}/export")
def export_test_config(test_id: int, db: Session = Depends(database.get_db),
                       current_user: models.User = Depends(get_current_active_user)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.owner_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test.config