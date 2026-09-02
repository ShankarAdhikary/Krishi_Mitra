"""Messaging provider boundary and bounded retry handling."""
from dataclasses import dataclass
from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import SmsLog
from app.utils.time import utc_now

MAX_SMS_ATTEMPTS = 2
DEFAULT_DAILY_SMS_CAP = 5


@dataclass
class MockMessagingProvider:
    name: str = "mock"

    def send_sms(self, farmer_phone: str, message_body: str) -> dict[str, str]:
        return {"status": "queued", "gateway": self.name, "message": message_body, "recipient": farmer_phone}

    def send_ivr(self, farmer_phone: str, script: str) -> dict[str, str]:
        return {"status": "queued", "gateway": self.name, "script": script, "recipient": farmer_phone}


class MessagingService:
    def __init__(self, db: Session | None = None, provider: MockMessagingProvider | None = None):
        self.db = db
        self.provider = provider or MockMessagingProvider()

    def count_outbound_sms(self, farmer_id: str, window_hours: int = 24) -> int:
        if self.db is None:
            return 0
        window_start = utc_now() - timedelta(hours=window_hours)
        return (
            self.db.query(SmsLog)
            .filter(
                SmsLog.farmer_id == farmer_id,
                SmsLog.direction == "outbound",
                SmsLog.sent_at.isnot(None),
                SmsLog.sent_at >= window_start,
            )
            .count()
        )

    def ensure_sms_capacity(self, farmer_id: str, daily_cap: int = DEFAULT_DAILY_SMS_CAP) -> None:
        if self.db is None:
            return
        if self.count_outbound_sms(farmer_id) >= daily_cap:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Daily SMS limit reached for this farmer",
            )

    def send_sms(self, farmer_phone: str, message_body: str) -> dict[str, str]:
        return self.provider.send_sms(farmer_phone, message_body)

    def send_ivr(self, farmer_phone: str, script: str) -> dict[str, str]:
        return self.provider.send_ivr(farmer_phone, script)

    def retry_failed(self) -> int:
        if self.db is None:
            raise ValueError("A database session is required to retry SMS messages")
        logs = self.db.query(SmsLog).filter(SmsLog.delivery_status == "failed", SmsLog.retry_count < MAX_SMS_ATTEMPTS - 1).all()
        for log in logs:
            log.retry_count += 1
            log.delivery_status = "sent"
            log.sent_at = utc_now()
        self.db.commit()
        return len(logs)
