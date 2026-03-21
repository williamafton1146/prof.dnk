from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas
from ..utils.formula_eval import compute_metrics

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/test/{uuid}")
def get_test_by_uuid(uuid: str, db: Session = Depends(database.get_db)):
    test = db.query(models.Test).filter(models.Test.public_uuid == uuid).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    # return only necessary fields: title, description, questions, client_fields
    return {
        "title": test.title,
        "description": test.description,
        "config": test.config,
        "public_uuid": test.public_uuid
    }

@router.post("/test/{uuid}")
def submit_test(uuid: str, submission: schemas.TestSessionCreate, db: Session = Depends(database.get_db)):
    test = db.query(models.Test).filter(models.Test.public_uuid == uuid).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    # compute metrics from formulas if any
    metrics = compute_metrics(test.config["metrics"], submission.answers) if test.config.get("metrics") else {}
    session = models.TestSession(
        test_id=test.id,
        client_name=submission.client_name,
        client_data=submission.client_data,
        answers=submission.answers,
        metrics=metrics
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id}