from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import io
import os
from .. import database, models, auth
from ..utils.report_generator import generate_docx_report, generate_html_report

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/session/{session_id}/client.docx")
def download_client_docx(session_id: int, db: Session = Depends(database.get_db),
                         current_user: models.User = Depends(auth.get_current_active_user)):
    session = db.query(models.TestSession).filter(models.TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    test = db.query(models.Test).filter(models.Test.id == session.test_id).first()
    if test.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your test")
    docx_bytes = generate_docx_report(session, test, report_type="client")
    return Response(content=docx_bytes, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    headers={"Content-Disposition": f"attachment; filename=client_report_{session_id}.docx"})

@router.get("/session/{session_id}/psychologist.docx")
def download_psychologist_docx(session_id: int, db: Session = Depends(database.get_db),
                               current_user: models.User = Depends(auth.get_current_active_user)):
    session = db.query(models.TestSession).filter(models.TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    test = db.query(models.Test).filter(models.Test.id == session.test_id).first()
    if test.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your test")
    docx_bytes = generate_docx_report(session, test, report_type="psychologist")
    return Response(content=docx_bytes, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    headers={"Content-Disposition": f"attachment; filename=psychologist_report_{session_id}.docx"})

@router.get("/session/{session_id}/client.html")
def get_client_html(session_id: int, db: Session = Depends(database.get_db),
                    current_user: models.User = Depends(auth.get_current_active_user)):
    session = db.query(models.TestSession).filter(models.TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    test = db.query(models.Test).filter(models.Test.id == session.test_id).first()
    if test.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your test")
    html = generate_html_report(session, test, report_type="client")
    return Response(content=html, media_type="text/html")

@router.get("/session/{session_id}/psychologist.html")
def get_psychologist_html(session_id: int, db: Session = Depends(database.get_db),
                          current_user: models.User = Depends(auth.get_current_active_user)):
    session = db.query(models.TestSession).filter(models.TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    test = db.query(models.Test).filter(models.Test.id == session.test_id).first()
    if test.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your test")
    html = generate_html_report(session, test, report_type="psychologist")
    return Response(content=html, media_type="text/html")