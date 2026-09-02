import logging
import time
import uuid

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.db.database import SessionLocal

from app.routers import (
    advisories,
    commands,
    dashboard,
    farmers,
    ingestion,
    institutional_auth,
    internal,
    messages,
    model_monitoring,
    plots,
    predictions,
    soil_moisture,
)
from app.utils import audit as _audit  # noqa: F401


logger = logging.getLogger(__name__)


app = FastAPI(
    title="Crop Advisory Backend",
    version="0.2.0",
    description=(
        "Backend for the SIH 2026 satellite-driven crop advisory system. "
        "Two-stage ML pipeline: Stage 1 (XGBoost soil-moisture regression) + "
        "Stage 2 (rule-based advisory decision engine). "
        "FPR-constrained model evaluation and canonical plot_features store."
    ),
)

# Existing routers
app.include_router(farmers.router)
app.include_router(plots.router)
app.include_router(commands.router)
app.include_router(ingestion.router)
app.include_router(ingestion.legacy_router)  # backwards-compatible /ingestion/trigger/{plot_id}
app.include_router(predictions.router)
app.include_router(advisories.router)
app.include_router(institutional_auth.router)
app.include_router(messages.router)
app.include_router(internal.router)
app.include_router(dashboard.router)

# New routers (sec 12.2 additions)
app.include_router(soil_moisture.router)      # POST /soil-moisture/{plot_id}
app.include_router(model_monitoring.router)   # GET/POST /model/evaluation/...


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id
    started_at = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("request_failed", extra={"request_id": request_id, "method": request.method, "path": request.url.path})
        raise
    duration_ms = round((time.perf_counter() - started_at) * 1000.0, 2)
    response.headers["x-request-id"] = request_id
    logger.info(
        "request_completed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        },
    )
    return response


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    payload = {
        "error": {"code": "validation_error", "message": str(exc)},
        "detail": str(exc),
        "request_id": request_id,
    }
    return JSONResponse(status_code=400, content=payload, headers={"x-request-id": request_id})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    payload = {
        "error": {"code": f"http_{exc.status_code}", "message": detail},
        "detail": detail,
        "request_id": request_id,
    }
    return JSONResponse(status_code=exc.status_code, content=payload, headers={"x-request-id": request_id})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception("unhandled_exception", extra={"request_id": request_id, "method": request.method, "path": request.url.path})
    payload = {
        "error": {"code": "internal_server_error", "message": "An unexpected error occurred"},
        "detail": "An unexpected error occurred",
        "request_id": request_id,
    }
    return JSONResponse(status_code=500, content=payload, headers={"x-request-id": request_id})


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    payload = {
        "error": {
            "code": "request_validation_error",
            "message": "Request validation failed",
            "details": exc.errors(),
        },
        "detail": "Request validation failed",
        "request_id": request_id,
    }
    return JSONResponse(status_code=422, content=payload, headers={"x-request-id": request_id})


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "crop-advisory-backend"}


@app.get("/ready")
def readiness_check() -> dict[str, object]:
    """Readiness includes a real database connectivity check."""
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database not ready") from exc
    finally:
        db.close()
    return {"status": "ready", "checks": {"database": "ok"}}
