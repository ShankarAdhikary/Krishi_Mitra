import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.auth import (
    create_institutional_access_token,
    hash_password,
    verify_institutional_access_token,
    verify_password,
)
from app.db.database import get_db
from app.models import InstitutionalUser
from app.utils.time import utc_now

router = APIRouter(prefix="/institutional", tags=["institutional-auth"])
bearer_scheme = HTTPBearer(auto_error=True)


class InstitutionalSignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = "viewer"
    assigned_geography: dict | None = None


class InstitutionalLoginRequest(BaseModel):
    email: EmailStr
    password: str


def get_current_institutional_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> InstitutionalUser:
    payload = verify_institutional_access_token(credentials.credentials)
    user = db.query(InstitutionalUser).filter(InstitutionalUser.user_id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="Institutional user not found")
    return user


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup_institutional_user(payload: InstitutionalSignupRequest, db: Session = Depends(get_db)) -> dict:
    existing = db.query(InstitutionalUser).filter(InstitutionalUser.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = InstitutionalUser(
        user_id=str(uuid.uuid4()),
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        assigned_geography=payload.assigned_geography or {},
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role,
        "assigned_geography": user.assigned_geography,
    }


@router.post("/login")
def login_institutional_user(payload: InstitutionalLoginRequest, db: Session = Depends(get_db)) -> dict:
    user = db.query(InstitutionalUser).filter(InstitutionalUser.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.last_login_at = utc_now()
    db.commit()

    token = create_institutional_access_token(
        user_id=user.user_id,
        role=user.role,
        assigned_geography=user.assigned_geography,
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def institutional_me(current_user: InstitutionalUser = Depends(get_current_institutional_user)) -> dict:
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "role": current_user.role,
        "assigned_geography": current_user.assigned_geography,
    }
