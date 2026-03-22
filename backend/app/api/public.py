from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Test, TestSession
from app.schemas import ClientSubmitData
from app.utils.metrics_engine import calculate_metrics

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/t/{test_id}")
def get_test_info(test_id: int, db: Session = Depends(get_db)):
    # A public endpoint to get basic test info (title, description) without auth
    # The actual test taking happens on the frontend using the config
    test = db.query(Test).filter(Test.id == test_id, Test.is_active == True).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found or inactive")
    
    # Return only necessary public info
    return {
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "config": test.config_json  # The frontend uses this to render the test
    }

@router.post("/t/{test_id}/{session_id}/submit")
def submit_test_response(
    test_id: int, 
    session_id: str, 
    submission: ClientSubmitData, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == test_id, Test.is_active == True).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found or inactive")
    
    # Check if session exists or create a new one based on session_id
    # In a more robust system, session_id might be linked to a pre-created session object in DB.
    # For this MVP, we treat the incoming session_id as unique and create a new session record.
    # It's crucial that the frontend generates a truly unique session_id per attempt.
    # A better approach might involve the frontend first requesting a session token from /tests/{id}/start.
    # But for simplicity, we proceed with the given structure.
    # We'll use the provided session_id as the primary identifier for this session instance.
    # WARNING: This requires trust that the frontend provides a globally unique UUID.

    # Validate required fields from config against submission.client_data
    required_fields = test.config_json.get("required_fields", ["client_name"])
    for field in required_fields:
        if field not in submission.client_data or not submission.client_data[field]:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Calculate metrics
    metrics = calculate_metrics(test.config_json, submission.answers)

    # Save session data
    db_session = TestSession(
        test_id=test_id,
        session_id=session_id,  # Added session_id to the model save if the model supports it
        client_name=submission.client_name,
        client_data=submission.client_data,
        answers=submission.answers,
        metrics=metrics,
        completed_at=func.now()  # Assuming completion happens on submit
    ) 
    db.add(db_session)
    db.commit()
    # Do not refresh as ID is auto-generated, and we don't need it back for client

    # Check if client should see report
    if test.show_report_to_client:
        # Option 1: Return a temporary link valid for this session
        # This is safer than returning the actual report content here
        # The link would be handled by another public endpoint
        # return { "message": "Success", "report_available": True, "report_link": f "/public/t/{test_id}/{db_session.id}/report/client" }
        
        # Option 2: Return success message only, and the frontend polls for availability or redirects to a fixed page
        return { "message": "Test submitted successfully!" }
    else:
        return { "message": "Test submitted successfully!" }