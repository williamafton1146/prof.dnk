from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, Date, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    psychologist = "psychologist"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(Enum(UserRole), default=UserRole.psychologist)
    is_active = Column(Boolean, default=True)
    access_until = Column(Date) # null если нет ограничения
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    tests = relationship("Test", back_populates="psychologist")
    profile = relationship("PsychologistProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class PsychologistProfile(Base):
    __tablename__ = "psychologist_profiles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    avatar_url = Column(String) # path to file
    about_md = Column(Text) # markdown text
    public_slug = Column(String, unique=True) # for /p/{slug}

    user = relationship("User", back_populates="profile")

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    psychologist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    config_json = Column(JSON, nullable=False) # Stores sections, questions, formulas etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    show_report_to_client = Column(Boolean, default=False) # Whether client can see their report

    # Relationships
    psychologist = relationship("User", back_populates="tests")
    sessions = relationship("TestSession", back_populates="test", cascade="all, delete-orphan")

class TestSession(Base):
    __tablename__ = "test_sessions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    client_name = Column(String, nullable=False) # Mandatory field
    client_data = Column(JSON) # e.g., {"age": 25, "city": "Moscow"}
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    answers = Column(JSON) # e.g., {"q1": "answer", "q2": [1,2]}
    metrics = Column(JSON) # Results of formulas: {"score": 85, "type": "E"}

    # Relationships
    test = relationship("Test", back_populates="sessions")

class ReportTemplate(Base):
    __tablename__ = "report_templates"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    type = Column(Enum("client", "specialist", name="report_type_enum"), nullable=False) # client or specialist
    docx_template_content = Column(Text) # Jinja2 template for docx content
    html_template_content = Column(Text) # Jinja2 template for html

    # Relationships
    test = relationship("Test")