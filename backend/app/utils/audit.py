"""Audit logging for consent, deletions, and compliance tracking (DPDP Act 2023)."""

from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Session

from app.db.database import Base
from app.utils.time import utc_now


class AuditEventType(str, Enum):
    FARMER_REGISTERED = "farmer_registered"
    CONSENT_GIVEN = "consent_given"
    PLOT_CREATED = "plot_created"
    ADVISORY_SENT = "advisory_sent"
    FEEDBACK_RECEIVED = "feedback_received"
    DATA_DELETION_REQUESTED = "data_deletion_requested"
    DATA_ANONYMIZED = "data_anonymized"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(String(36), primary_key=True)
    event_type = Column(String(50), nullable=False)
    farmer_id = Column(String(36), nullable=True)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(36), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


def log_audit_event(db: Session, audit_id: str, event_type: AuditEventType, farmer_id: str = None, entity_type: str = None, entity_id: str = None, details: str = None) -> None:
    """Log an audit event for compliance and audit trails."""
    event = AuditLog(
        audit_id=audit_id,
        event_type=event_type.value,
        farmer_id=farmer_id,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
    )
    db.add(event)
    db.commit()
