from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

# --- User ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    access_until: Optional[str] = None # ISO date string
    is_active: Optional[bool] = None

class UserPublic(UserBase):
    id: int
    role: str
    is_active: bool
    access_until: Optional[str] # ISO date string
    class Config:
        from_attributes = True

# --- Profile ---
class PsychologistProfileIn(BaseModel):
    avatar_url: Optional[str] = None
    about_md: Optional[str] = None
    public_slug: Optional[str] = None

class PsychologistProfileOut(PsychologistProfileIn):
    user_id: int
    class Config:
        from_attributes = True

# --- Test ---
class TestConfig(BaseModel):
    # Example structure, can be complex
    sections: List[Dict[str, Any]]
    questions: List[Dict[str, Any]]
    formulas: Dict[str, str] # e.g., {"metric1": "sum(q1, q2)"}
    required_fields: List[str] = ["client_name"] # Always required

class TestBase(BaseModel):
    title: str
    description: Optional[str] = None
    config: TestConfig
    show_report_to_client: bool = False

class TestCreate(TestBase):
    pass

class TestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    config: Optional[TestConfig] = None
    show_report_to_client: Optional[bool] = None

class TestOut(TestBase):
    id: int
    psychologist_id: int
    created_at: datetime
    is_active: bool
    class Config:
        from_attributes = True

# --- Session ---
class TestSessionBase(BaseModel):
    client_name: str
    client_data: Optional[Dict[str, Any]] = None
    answers: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None

class TestSessionCreate(TestSessionBase):
    pass

class TestSessionOut(TestSessionBase):
    id: int
    test_id: int
    started_at: datetime
    completed_at: Optional[datetime]
    class Config:
        from_attributes = True

# --- Public Submit ---
class ClientSubmitData(BaseModel):
    client_name: str
    client_data: Optional[Dict[str, Any]] = {} # e.g., {"age": 25}
    answers: Dict[str, Any]

# --- Reports ---
class ReportTemplateBase(BaseModel):
    type: str # "client" or "specialist"
    docx_template_content: Optional[str] = None
    html_template_content: Optional[str] = None

class ReportTemplateCreate(ReportTemplateBase):
    test_id: int

class ReportTemplateOut(ReportTemplateBase):
    id: int
    test_id: int
    class Config:
        from_attributes = True

# --- Responses ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

class LinkResponse(BaseModel):
    link: str