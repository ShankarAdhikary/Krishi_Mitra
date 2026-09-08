# Crop Advisory Backend

This backend is the initial implementation of the SIH 2026 crop advisory platform, based on the project documentation in `Required Docx/`.

## Stack

- Python 3.13+
- FastAPI
- PostgreSQL + PostGIS for production
- SQLite fallback for local smoke testing and dev bootstrapping
- SQLAlchemy + Pydantic

## Quick start

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --reload
```

For a new or upgraded database, apply migrations before starting the API:

```bash
alembic upgrade head
```

The API does not run migrations automatically. Run this as a deployment step
using the same `DATABASE_URL` as the API to avoid replica migration races.

### Local dashboard demo data

To populate the local SQLite database with a repeatable, clearly marked
dataset for the institutional dashboard:

```bash
../.venv/bin/python scripts/seed_demo_data.py
```

This creates 50 demo farmers, 70 demo plots across 10 villages in
Yavatmal, Maharashtra, covering cotton, maize, wheat, rice, sugarcane, and
groundnut. It also creates 14 days of advisory history and two model
evaluation versions. The local demo account is:
`demo@krishimitra.example.com` / `DemoPassword123!`. Never run this seed
against a production database.

## Notes

- The app defaults to SQLite locally so the project can boot without a running Postgres instance.
- `/health` and `/health/live` are liveness probes. `/ready` and
  `/health/ready` verify database connectivity and return `503` until the
  database is usable.
- For production or staged environments, set `DATABASE_URL` to a PostgreSQL/PostGIS value in `.env`.
- NIR API configuration and the agreed request/response contract are documented in `docs/ML_API_CONTRACT.md`.
- Communications use `SMS_PROVIDER=mock` locally. Set `SMS_PROVIDER=twilio` and provide
  the `TWILIO_*` secrets in deployment configuration for SMS, WhatsApp, voice calls,
  and signed delivery callbacks. Register the callback URL in Twilio and complete
  India DLT/template approval before sending production SMS.
- Set `ML_API_KEY` in `.env` or deployment secrets to enable the remote predictor; leave it unset to exercise the legacy fallback locally.
- The code is intentionally structured as a strong starter implementation, not a full production deployment.

### India-wide dashboard validation dataset

For a repeatable local load test with every state/UT and the district catalogue
available from the open geometry source, run:

```bash
PYTHONPATH=. ../.venv/bin/python scripts/seed_india_dataset.py \
  --count 2500 --history-days 90 --districts-file /path/to/india_district.geojson
```

The script creates 2,500 farmers and plots, 90 days of daily weather rows,
Sentinel-1/Sentinel-2-shaped observations, 30 days of canonical feature rows,
and 14 days of prediction/advisory history. Rows are prefixed
`india-demo-` and marked `synthetic_demo`; they are for dashboard/model
contract validation only and must not be presented as measured satellite or
weather observations.

The dashboard trend endpoint now returns live environmental aggregates from
`plot_features` alongside advisory counts. To use measured data, configure the
live ingestion provider (`INGESTION_PROVIDER=live`) with Earth Engine
credentials and rerun ingestion; the synthetic rows should then be removed
from the development database before evaluating production model performance.
