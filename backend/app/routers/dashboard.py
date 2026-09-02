from collections import Counter, defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Advisory, Farmer, InstitutionalUser, Plot
from app.routers.institutional_auth import get_current_institutional_user
from app.utils.time import utc_now

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

MIN_AGGREGATION_THRESHOLD = 5


def _scope_query(db: Session, state: str | None = None, district: str | None = None):
    query = db.query(Plot).join(Farmer, Farmer.farmer_id == Plot.farmer_id)
    if district:
        query = query.filter(Farmer.district == district)
    elif state:
        query = query.filter(Farmer.state == state)
    return query


def _scope_label(state: str | None, district: str | None) -> str:
    if district:
        return district
    if state:
        return state
    return "pilot-district"


def _enforce_scope(
    current_user: InstitutionalUser, state: str | None, district: str | None
) -> tuple[str | None, str | None]:
    if current_user.role == "admin":
        return state, district

    assigned = current_user.assigned_geography or {}
    allowed_states = set(assigned.get("states", []))
    allowed_districts = set(assigned.get("districts", []))

    if district:
        if district not in allowed_districts:
            raise PermissionError("Requested district is not in assigned geography")
        return None, district

    if state:
        if state not in allowed_states:
            raise PermissionError("Requested state is not in assigned geography")
        return state, None

    if allowed_districts:
        return None, sorted(allowed_districts)[0]
    if allowed_states:
        return sorted(allowed_states)[0], None
    raise PermissionError("No assigned geography configured for this institutional user")


def _latest_advisories_by_plot(db: Session, plot_ids: list[str], window_start: datetime) -> dict[str, Advisory]:
    advisories = (
        db.query(Advisory)
        .filter(Advisory.plot_id.in_(plot_ids), Advisory.created_at >= window_start)
        .order_by(Advisory.plot_id.asc(), Advisory.created_at.desc())
        .all()
    )
    latest: dict[str, Advisory] = {}
    for advisory in advisories:
        if advisory.plot_id not in latest:
            latest[advisory.plot_id] = advisory
    return latest


@router.get("/aggregates")
def get_aggregates(
    state: str | None = None,
    district: str | None = None,
    window_days: int = 7,
    current_user: InstitutionalUser = Depends(get_current_institutional_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    try:
        state, district = _enforce_scope(current_user, state, district)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc

    scope = _scope_query(db, state=state, district=district)
    plot_ids = [plot.plot_id for plot in scope.all()]
    total_plots = len(plot_ids)
    scope_name = _scope_label(state, district)

    if total_plots < MIN_AGGREGATION_THRESHOLD:
        return {
            "scope": scope_name,
            "window_days": window_days,
            "suppressed": True,
            "total_plots": 0,
            "alert_rate": 0.0,
            "summary": {"no_action": 0, "monitor": 0, "irrigate_soon": 0, "irrigate_now": 0},
        }

    window_start = utc_now() - timedelta(days=window_days)
    latest = _latest_advisories_by_plot(db, plot_ids, window_start)

    summary = Counter(advisory.advisory_class for advisory in latest.values())
    alerts = sum(1 for advisory in latest.values() if advisory.advisory_class in {"monitor", "irrigate_soon", "irrigate_now"})
    alert_rate = round((alerts / total_plots) * 100.0, 1) if total_plots else 0.0

    return {
        "scope": scope_name,
        "window_days": window_days,
        "suppressed": False,
        "total_plots": total_plots,
        "alert_rate": alert_rate,
        "summary": {
            "no_action": summary.get("no_action", 0),
            "monitor": summary.get("monitor", 0),
            "irrigate_soon": summary.get("irrigate_soon", 0),
            "irrigate_now": summary.get("irrigate_now", 0),
        },
    }


@router.get("/trends")
def get_trends(
    state: str | None = None,
    district: str | None = None,
    window_days: int = 14,
    current_user: InstitutionalUser = Depends(get_current_institutional_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    try:
        state, district = _enforce_scope(current_user, state, district)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc

    scope = _scope_query(db, state=state, district=district)
    plot_ids = [plot.plot_id for plot in scope.all()]
    scope_name = _scope_label(state, district)

    if len(plot_ids) < MIN_AGGREGATION_THRESHOLD:
        return {"scope": scope_name, "window_days": window_days, "suppressed": True, "series": []}

    window_start = utc_now() - timedelta(days=window_days)
    advisories = (
        db.query(Advisory)
        .filter(Advisory.plot_id.in_(plot_ids), Advisory.created_at >= window_start)
        .order_by(Advisory.created_at.asc())
        .all()
    )

    buckets: dict[str, Counter[str]] = defaultdict(Counter)
    for advisory in advisories:
        day = advisory.created_at.date().isoformat()
        buckets[day][advisory.advisory_class] += 1

    series = [
        {
            "date": day,
            "no_action": counts.get("no_action", 0),
            "monitor": counts.get("monitor", 0),
            "irrigate_soon": counts.get("irrigate_soon", 0),
            "irrigate_now": counts.get("irrigate_now", 0),
        }
        for day, counts in sorted(buckets.items())
    ]

    return {"scope": scope_name, "window_days": window_days, "suppressed": False, "series": series}


# ---------------------------------------------------------------------------
# Model Health Panel (sec 12.5.1)
# ---------------------------------------------------------------------------

@router.get("/model-health")
def get_model_health(
    agro_zone: str | None = None,
    current_user: InstitutionalUser = Depends(get_current_institutional_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    """
    Model-health panel for the KVK/admin dashboard (sec 12.5.1).

    Returns the latest evaluation metrics per model version including:
      - Stage 1: RMSE, MAE, R2
      - Stage 2: Accuracy, Precision, Recall, F1, FPR
    FPR alert is included if any model's FPR exceeds the default threshold.
    """
    from app.models import ModelEvaluationRun
    from app.services.model_evaluation_service import DEFAULT_FPR_THRESHOLD, ModelEvaluationService

    service = ModelEvaluationService(db)
    runs = service.get_latest_per_version(agro_zone=agro_zone)

    versions = []
    alerts = []
    for run in runs:
        entry = {
            "model_version": run.model_version,
            "agro_zone": run.agro_zone,
            "trained_at": run.trained_at.isoformat() if run.trained_at else None,
            "stage1_rmse": float(run.rmse) if run.rmse is not None else None,
            "stage1_r2": float(run.r2) if run.r2 is not None else None,
            "stage2_recall": float(run.recall) if run.recall is not None else None,
            "stage2_fpr": float(run.fpr) if run.fpr is not None else None,
            "passed_fpr_threshold": run.passed_fpr_threshold,
        }
        versions.append(entry)
        if run.fpr is not None and float(run.fpr) > DEFAULT_FPR_THRESHOLD:
            alerts.append({
                "model_version": run.model_version,
                "agro_zone": run.agro_zone,
                "fpr": float(run.fpr),
                "threshold": DEFAULT_FPR_THRESHOLD,
                "alert": "FPR EXCEEDED THRESHOLD -- auto-promotion blocked, manual review required",
            })

    return {
        "agro_zone": agro_zone,
        "fpr_threshold": DEFAULT_FPR_THRESHOLD,
        "model_versions": versions,
        "fpr_alerts": alerts,
        "has_alerts": len(alerts) > 0,
    }
