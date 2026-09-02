"""Provider boundary for EO/weather ingestion.

Live providers are deliberately not selected until their credentials and
dataset contracts are supplied.  This keeps demo data explicit and prevents
accidental production use of generated observations.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Protocol

from app.models import Plot, SatelliteData
from app.services.mock_data_generator import generate_mock_ndvi, generate_mock_sar, generate_mock_weather
from app.utils.time import utc_now


class IngestionProvider(Protocol):
    name: str

    def fetch_cycle(self, plot: Plot) -> list[SatelliteData]: ...


class MockIngestionProvider:
    name = "mock"

    def fetch_cycle(self, plot: Plot) -> list[SatelliteData]:
        # Stable historical observations ending near the current cycle.
        base_date = utc_now() - timedelta(days=24)
        return (
            generate_mock_ndvi(plot.plot_id, base_date, num_cycles=5)
            + generate_mock_sar(plot.plot_id, base_date, num_cycles=3)
            + generate_mock_weather(plot.plot_id, utc_now() - timedelta(days=4), num_cycles=5)
        )


class LiveProviderNotConfigured:
    name = "live"

    def fetch_cycle(self, plot: Plot) -> list[SatelliteData]:
        raise RuntimeError(
            "Live ingestion is not configured. Supply a Google Earth Engine/Copernicus "
            "provider and credentials, then set INGESTION_PROVIDER accordingly."
        )


def get_ingestion_provider(name: str) -> IngestionProvider:
    if name.lower() == "mock":
        return MockIngestionProvider()
    return LiveProviderNotConfigured()
