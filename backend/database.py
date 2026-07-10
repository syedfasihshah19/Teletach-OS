"""SQLAlchemy Database Layer — SQLite for demo, PostgreSQL-ready via connection string swap.

Change DATABASE_URL to 'postgresql+asyncpg://user:pass@host/db' for production.
"""
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Float, Integer, Text, DateTime, Boolean, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import Optional

DATABASE_URL = "sqlite:///./telegenesis.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=False)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


# ─── Tables ───

class DBIncident(Base):
    __tablename__ = "incidents"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    severity = Column(String, default="major")
    status = Column(String, default="open")
    affected_nodes = Column(JSON, default=list)
    affected_region = Column(String, default="")
    source_alarm_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    agent_findings = Column(JSON, default=list)
    consensus = Column(JSON, nullable=True)


class DBReport(Base):
    __tablename__ = "reports"
    id = Column(String, primary_key=True)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text)
    content = Column(Text)
    incident_id = Column(String, nullable=True)
    ai_generated = Column(Boolean, default=True)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class DBOptimization(Base):
    __tablename__ = "optimizations"
    id = Column(String, primary_key=True)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    current_value = Column(String, default="")
    projected_value = Column(String, default="")
    improvement_pct = Column(Float, default=0.0)
    status = Column(String, default="proposed")
    confidence = Column(Float, default=0.0)
    evidence = Column(JSON, default=list)
    impact = Column(JSON, default=dict)
    risk_level = Column(String, default="low")
    rollback_available = Column(Boolean, default=True)
    alternatives = Column(JSON, default=list)  # ranked alternative solutions
    ai_generated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DBDecisionMemory(Base):
    __tablename__ = "decision_memory"
    id = Column(String, primary_key=True)
    type = Column(String, nullable=False)  # investigation, report, optimization, decision
    incident_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    summary = Column(Text)
    data = Column(JSON, default=dict)  # full structured data
    outcome = Column(String, nullable=True)  # success, partial, failed
    engineer_decision = Column(String, nullable=True)  # accepted, rejected, modified
    lessons_learned = Column(Text, nullable=True)
    tags = Column(JSON, default=list)  # for search: ["ospf", "congestion", "north"]
    embedding = Column(JSON, nullable=True)  # semantic embedding vector for RAG retrieval
    created_at = Column(DateTime, default=datetime.utcnow)


class DBAgentActivity(Base):
    """Real agent execution telemetry — every AI call is logged here."""
    __tablename__ = "agent_activity"
    id = Column(String, primary_key=True)
    agent_type = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    action = Column(String, default="analyze")
    detail = Column(Text, default="")
    status = Column(String, default="success")  # success, failed, timeout
    duration_ms = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    model_used = Column(String, default="")
    workflow_name = Column(String, default="")
    workflow_step = Column(Integer, default=-1)
    incident_id = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)


class DBSimulation(Base):
    """Persisted Digital Twin simulation results with AI analysis."""
    __tablename__ = "simulations"
    id = Column(String, primary_key=True)
    scenario_type = Column(String, nullable=False)
    scenario_name = Column(String, default="")
    before_metrics = Column(JSON, default=dict)
    after_metrics = Column(JSON, default=dict)
    improvement_pct = Column(JSON, default=dict)
    ai_analysis = Column(Text, default="")
    risk_assessment = Column(Text, default="")
    rollback_plan = Column(Text, default="")
    confidence = Column(Float, default=0.0)
    customer_impact = Column(Text, default="")
    recommendations = Column(JSON, default=list)
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Init ───

def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_session():
    """Get a direct session (non-generator)."""
    return SessionLocal()
