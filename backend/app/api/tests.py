from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Test, TestSession, ReportTemplate
from app.schemas import TestCreate, TestUpdate, TestOut, TestSessionOut, ReportTemplateCreate, ReportTemplateOut
from app.security import get_current_user
from app.utils.metrics_engine import calculate_metrics
from app.utils.report_generator import generate_docx_report, generate_html_report
from fastapi.responses import StreamingResponse
from io import BytesIO
import os
import uuid

router = APIRouter(prefix="/tests", tags=["tests"])

@router.post("/", response_model=TestOut)
def create_test(test: TestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "psychologist":
        raise HTTPException(status_code=403, detail="Only psychologists can create tests.")
    # Validate config here if needed

    db_test = Test(
        title=test.title,
        description=test.description,
        psychologist_id=current_user.id,
        config_json=test.config.model_dump(), # Pydantic v2 syntax
        show_report_to_client=test.show_report_to_client
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

@router.get("/")
def list_tests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "psychologist":
        raise HTTPException(status_code=403, detail="Only psychologists can list tests.")
    tests = db.query(Test).filter(Test.psychologist_id == current_user.id).all()
    results = []
    for t in tests:
        last_session = db.query(TestSession).filter(TestSession.test_id == t.id).order_by(TestSession.started_at.desc()).first()
        session_count = db.query(TestSession).filter(TestSession.test_id == t.id).count()
        results.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "created_at": t.created_at,
            "is_active": t.is_active,
            "show_report_to_client": t.show_report_to_client,
            "session_count": session_count,
            "last_filled_at": last_session.started_at if last_session else None
        })
    return results

@router.get("/{test_id}")
def get_test(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.psychologist_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found or not authorized")
    return test

@router.put("/{test_id}", response_model=TestOut)
def update_test(test_id: int, test_update: TestUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.psychologist_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found or not authorized")
    update_data = test_update.model_dump(exclude_unset=True)
    if "config" in update_data:
        update_data["config_json"] = update_data.pop("config").model_dump()
    for field, value in update_data.items():
        setattr(test, field, value)
    db.commit()
    db.refresh(test)
    return test

@router.delete("/{test_id}")
def delete_test(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.psychologist_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found or not authorized")
    db.delete(test)
    db.commit()
    return {"message": "Test deleted successfully"}

@router.get("/{test_id}/link")
def get_test_link(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.psychologist_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found or not authorized")
    # Generate a unique session ID for the link
    session_id = str(uuid.uuid4())
    # Note: In a real scenario, you'd store this session ID and associate it with the test later when client starts.
    # For simplicity here, we assume the client will start immediately.
    frontend_host = os.getenv("FRONTEND_HOST", "http://localhost:3000") # Placeholder
    link = f"{frontend_host}/t/{test_id}/{session_id}"
    return {"link": link}

@router.get("/{test_id}/sessions")
def list_test_sessions(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.psychologist_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found or not authorized")
    sessions = db.query(TestSession).filter(TestSession.test_id == test_id).all()
    return sessions

@router.get("/{test_id}/sessions/{session_id}/report/{report_type}")
def get_report(test_id: int, session_id: str, report_type: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.psychologist_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code, detail="Test not found or not authorized")
    
    session = db.query(TestSession).filter(TestSession.test_id == test_id, TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if report_type not in ["client", "specialist"]:
        raise HTTPException(status_code=400, detail="Invalid report type. Use 'client' or 'specialist'.")

    template = db.query(ReportTemplate).filter(ReportTemplate.test_id == test_id, ReportTemplate.type == report_type).first()
    if not template:
         raise HTTPException(status_code=404, detail=f"No {report_type} report template found for this test.")

    # Data for the report
    report_data = {
        "client_name": session.client_name,
        "test_title": test.title,
        "answers": session.answers,
        "metrics": session.metrics or {},
        "config": test.config_json
    }

    if report_type == "client" and not test.show_report_to_client:
        # Option 1: Return a message instead of the report
        # return {"message": "Client report is not available for this test."}
        # Option 2: Allow access but this is less secure. Let's stick to 403.
        raise HTTPException(status_code=403, detail="Client report is not enabled for this test.")

    # Generate report dynamically
    if report_type.endswith("docx"):
        content = generate_docx_report(report_data, template.docx_template_content)
        return StreamingResponse(BytesIO(content), media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', headers={"Content-Disposition": f"attachment; filename=report_{session_id}.docx"})
    else: # Assume HTML
        content = generate_html_report(report_data, template.html_template_content)
        return StreamingResponse(BytesIO(content.encode()), media_type='text/html')

@router.post("/{test_id}/templates", response_model=ReportTemplateOut)
def create_report_template(template: ReportTemplateCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == template.test_id, Test.psychologist_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found or not authorized")
    if template.type not in ["client", "specialist"]:
        raise HTTPException(status_code=400, detail="Invalid report type.")
    db_template = ReportTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

# Clone Test Endpoint
@router.post("/{test_id}/clone")
def clone_test(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    original_test = db.query(Test).filter(Test.id == test_id, Test.psychologist_id == current_user.id).first()
    if not original_test:
        raise HTTPException(status_code=404, detail="Test not found or not authorized")
    
    new_config = original_test.config_json.copy()
    new_title = f"{original_test.title} (Copy)"
    
    new_test = Test(
        title=new_title,
        description=original_test.description,
        psychologist_id=current_user.id,
        config_json=new_config,
        show_report_to_client=original_test.show_report_to_client
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test