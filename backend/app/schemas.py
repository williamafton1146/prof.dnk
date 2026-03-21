from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Dict, Any, List

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    is_admin: Optional[bool] = False
    access_until: Optional[datetime] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    access_until: Optional[datetime] = None
    photo: Optional[str] = None
    bio: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    access_until: Optional[datetime] = None
    photo: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

# Test schemas
class QuestionConfig(BaseModel):
    id: str   # unique within test, e.g., "q1"
    text: str
    type: str  # text, multiline, single, multiple, yesno, numeric, slider, date, rating, color_sort
    required: bool = True
    options: Optional[List[str]] = None   # for single/multiple/rating (labels)
    min: Optional[float] = None           # for numeric/slider
    max: Optional[float] = None
    step: Optional[float] = None

class MetricFormula(BaseModel):
    name: str
    expression: str   # e.g., "q1 + q2 * 2"

class TestConfig(BaseModel):
    questions: List[QuestionConfig]
    metrics: List[MetricFormula] = []
    client_fields: List[str] = []   # additional fields to ask client (e.g., age, email)
    show_report_to_client: bool = False

class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    config: TestConfig

class TestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    config: Optional[TestConfig] = None

class TestResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    public_uuid: str
    config: TestConfig
    created_at: datetime
    updated_at: Optional[datetime]
    owner_id: int
    sessions_count: Optional[int] = 0
    last_session_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Test Session schemas
class TestSessionCreate(BaseModel):
    client_name: str
    client_data: Optional[Dict[str, Any]] = None
    answers: Dict[str, Any]   # question_id -> answer

class TestSessionResponse(BaseModel):
    id: int
    test_id: int
    client_name: str
    client_data: Optional[Dict[str, Any]]
    answers: Dict[str, Any]
    metrics: Optional[Dict[str, Any]]
    completed_at: datetime

    class Config:
        orm_mode = True

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str