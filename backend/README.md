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

## Notes

- The app defaults to SQLite locally so the project can boot without a running Postgres instance.
- For production or staged environments, set `DATABASE_URL` to a PostgreSQL/PostGIS value in `.env`.
- The code is intentionally structured as a strong starter implementation, not a full production deployment.
