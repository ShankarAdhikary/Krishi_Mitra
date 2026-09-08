from collections import Counter, defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Advisory, Farmer, InstitutionalUser, MlPrediction, Plot, PlotFeatures
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
            "nri_percent": None,
            "nri_plot_count": 0,
            "summary": {"no_action": 0, "monitor": 0, "irrigate_soon": 0, "irrigate_now": 0},
        }

    window_start = utc_now() - timedelta(days=window_days)
    latest = _latest_advisories_by_plot(db, plot_ids, window_start)
    prediction_ids = [advisory.prediction_id for advisory in latest.values()]
    predictions = (
        db.query(MlPrediction)
        .filter(MlPrediction.prediction_id.in_(prediction_ids))
        .all()
        if prediction_ids
        else []
    )
    nri_values = [
        float((prediction.input_feature_snapshot or {}).get("nir_percent"))
        for prediction in predictions
        if (prediction.input_feature_snapshot or {}).get("provider") == "nir_api"
        and (prediction.input_feature_snapshot or {}).get("nir_percent") is not None
    ]

    summary = Counter(advisory.advisory_class for advisory in latest.values())
    alerts = sum(1 for advisory in latest.values() if advisory.advisory_class in {"monitor", "irrigate_soon", "irrigate_now"})
    alert_rate = round((alerts / total_plots) * 100.0, 1) if total_plots else 0.0

    return {
        "scope": scope_name,
        "window_days": window_days,
        "suppressed": False,
        "total_plots": total_plots,
        "alert_rate": alert_rate,
        "nri_percent": round(sum(nri_values) / len(nri_values), 1) if nri_values else None,
        "nri_plot_count": len(nri_values),
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

    feature_rows = (
        db.query(PlotFeatures)
        .filter(PlotFeatures.plot_id.in_(plot_ids), PlotFeatures.obs_date >= window_start.date())
        .order_by(PlotFeatures.obs_date.asc())
        .all()
    )
    environmental_buckets: dict[str, list[PlotFeatures]] = defaultdict(list)
    for row in feature_rows:
        environmental_buckets[row.obs_date.isoformat()].append(row)

    environmental_series = []
    for day, rows in sorted(environmental_buckets.items()):
        def average(attribute: str) -> float | None:
            values = [float(getattr(row, attribute)) for row in rows if getattr(row, attribute) is not None]
            return round(sum(values) / len(values), 4) if values else None

        environmental_series.append({
            "date": day,
            "ndvi": average("ndvi"),
            "nir_proxy": average("savi"),
            "rainfall_7d": average("rainfall_7d"),
            "soil_moisture": average("soil_moisture_label"),
            "vv_db": average("vv_db"),
            "plots_observed": len(rows),
        })

    crop_buckets: dict[str, list[PlotFeatures]] = defaultdict(list)
    soil_buckets: dict[str, list[PlotFeatures]] = defaultdict(list)
    plot_lookup = {plot.plot_id: plot for plot in scope.all()}
    for row in feature_rows:
        plot = plot_lookup.get(row.plot_id)
        if plot:
            crop_buckets[plot.crop_type].append(row)
            if plot.soil_texture:
                soil_buckets[plot.soil_texture].append(row)

    def summarize_groups(groups: dict[str, list[PlotFeatures]]) -> list[dict[str, object]]:
        result = []
        for name, rows in sorted(groups.items()):
            ndvi_values = [float(row.ndvi) for row in rows if row.ndvi is not None]
            rainfall_values = [float(row.rainfall_7d) for row in rows if row.rainfall_7d is not None]
            result.append({
                "name": name,
                "observations": len(rows),
                "avg_ndvi": round(sum(ndvi_values) / len(ndvi_values), 4) if ndvi_values else None,
                "avg_rainfall_7d": round(sum(rainfall_values) / len(rainfall_values), 2) if rainfall_values else None,
            })
        return result

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

    return {
        "scope": scope_name,
        "window_days": window_days,
        "suppressed": False,
        "series": series,
        "environmental_series": environmental_series,
        "data_provenance": {
            "sentinel1": "plot_features.vv_db",
            "sentinel2": "plot_features.ndvi/savi",
            "weather": "plot_features.rainfall_7d",
        },
        "crop_summary": summarize_groups(crop_buckets),
        "soil_summary": summarize_groups(soil_buckets),
    }


@router.get("/registry")
def get_registry(
    state: str | None = None,
    district: str | None = None,
    current_user: InstitutionalUser = Depends(get_current_institutional_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    """Return government-facing farmer and plot registry analytics."""
    try:
        state, district = _enforce_scope(current_user, state, district)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc

    farmers_query = db.query(Farmer)
    if district:
        farmers_query = farmers_query.filter(Farmer.district == district)
    elif state:
        farmers_query = farmers_query.filter(Farmer.state == state)
    farmers = farmers_query.order_by(Farmer.created_at.desc()).all()
    farmer_ids = [farmer.farmer_id for farmer in farmers]
    plots = (
        db.query(Plot)
        .filter(Plot.farmer_id.in_(farmer_ids))
        .order_by(Plot.created_at.desc())
        .all()
        if farmer_ids
        else []
    )
    plots_by_farmer: dict[str, list[Plot]] = defaultdict(list)
    for plot in plots:
        plots_by_farmer[plot.farmer_id].append(plot)

    crop_counts = Counter(plot.crop_type for plot in plots)
    return {
        "scope": _scope_label(state, district),
        "total_farmers": len(farmers),
        "active_farmers": sum(1 for farmer in farmers if farmer.status == "active"),
        "total_plots": len(plots),
        "active_plots": sum(1 for plot in plots if plot.status == "active"),
        "crop_distribution": dict(sorted(crop_counts.items())),
        "farmers": [
            {
                "farmer_id": farmer.farmer_id,
                "name": farmer.name or "Unnamed farmer",
                "phone_number": farmer.phone_number,
                "state": farmer.state,
                "district": farmer.district,
                "preferred_language": farmer.preferred_language,
                "status": farmer.status,
                "registration_channel": farmer.registration_channel,
                "registered_at": farmer.created_at.isoformat(),
                "plots": [
                    {
                        "plot_id": plot.plot_id,
                        "name": plot.plot_nickname or "Unnamed plot",
                        "crop": plot.crop_type,
                        "village": plot.village_name,
                        "size_acres": float(plot.plot_size_declared) if plot.plot_size_declared is not None else None,
                        "status": plot.status,
                        "data_status": plot.data_status,
                        "last_ingestion_at": plot.last_ingestion_at.isoformat() if plot.last_ingestion_at else None,
                    }
                    for plot in plots_by_farmer.get(farmer.farmer_id, [])
                ],
            }
            for farmer in farmers
        ],
    }


@router.get("/geography")
def get_geography(
    current_user: InstitutionalUser = Depends(get_current_institutional_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    """Return all seeded/registered state and district combinations in scope."""
    rows = (
        db.query(Farmer.state, Farmer.district)
        .filter(Farmer.state.isnot(None), Farmer.district.isnot(None))
        .distinct()
        .order_by(Farmer.state.asc(), Farmer.district.asc())
        .all()
    )
    grouped: dict[str, list[str]] = defaultdict(list)
    assigned = current_user.assigned_geography or {}
    for state, district in rows:
        if current_user.role != "admin" and (
            (assigned.get("states") and state not in assigned["states"])
            or (assigned.get("districts") and district not in assigned["districts"])
        ):
            continue
        grouped[state].append(district)
    return {"states": sorted(grouped), "districts_by_state": grouped}


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
