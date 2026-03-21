from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    access_until = Column(DateTime)  # when the psychologist's access expires
    photo = Column(String, nullable=True)   # URL to photo (stored as base64 or cloud)
    bio = Column(Text, nullable=True)       # Markdown bio
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tests = relationship("Test", back_populates="owner", cascade="all, delete-orphan")

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    public_uuid = Column(String, unique=True, index=True, nullable=False)  # for client link
    config = Column(JSON, nullable=False)   # stores questions, metrics, formulas, settings
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    owner = relationship("User", back_populates="tests")
    sessions = relationship("TestSession", back_populates="test", cascade="all, delete-orphan")

class TestSession(Base):
    __tablename__ = "test_sessions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    client_name = Column(String, nullable=False)
    client_data = Column(JSON)           # additional fields requested by psychologist (e.g., age, email)
    answers = Column(JSON, nullable=False)   # dict {question_id: answer}
    metrics = Column(JSON)               # computed metrics from formulas
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    test = relationship("Test", back_populates="sessions")