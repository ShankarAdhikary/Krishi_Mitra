"""Client for the ML team's Net Irrigation Requirement API."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any
import time

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class NirPrediction:
    nir: float
    advice: str
    urgency: str
    confidence: float | None
    model_version: str
    request: dict[str, Any]


class NirApiError(RuntimeError):
    """Raised when the remote NIR service cannot provide a valid prediction."""


class NirApiService:
    """Small, synchronous API client used by the synchronous prediction routes."""

    def __init__(self) -> None:
        settings = get_settings()
        self.enabled = settings.ml_api_enabled and bool(settings.ml_api_key)
        self.url = settings.ml_api_url.rstrip("/")
        self.api_key = settings.ml_api_key
        self.timeout = settings.ml_api_timeout_seconds
        self.model_version_override = settings.ml_api_model_version
        self._consecutive_failures = 0
        self._circuit_open_until = 0.0
        # lightweight runtime counters for operational visibility (logged only)
        self._request_count = 0
        self._normalization_events = 0

    def predict(self, payload: dict[str, Any]) -> NirPrediction:
        if not self.enabled:
            raise NirApiError("NIR API is disabled or ML_API_KEY is not configured")

        body = self._request("/predict", payload)

        try:
            nir = float(body["nir"])
            advice = str(body["advice"])
            urgency = str(body["urgency"]).upper()
            confidence = self._normalize_confidence(body.get("confidence"))
        except (KeyError, TypeError, ValueError) as exc:
            raise NirApiError("NIR API returned an invalid prediction response") from exc

        if not 0 <= nir <= 100 or urgency not in {"URGENT", "MODERATE", "SAFE"}:
            raise NirApiError("NIR API returned values outside the supported ranges")

        model_version = (
            self.model_version_override
            or str(body.get("model_version") or body.get("version") or "nir-api-unknown")
        )
        return NirPrediction(
            nir=nir,
            advice=advice,
            urgency=urgency,
            confidence=confidence,
            model_version=model_version,
            request=payload,
        )

    def predict_batch(self, payloads: list[dict[str, Any]]) -> list[NirPrediction]:
        """Predict a bounded batch, preserving response order."""
        if not payloads:
            return []
        body = self._request("/predict_batch", payloads)
        if not isinstance(body, list):
            raise NirApiError("NIR API returned an invalid batch response")
        return [self._parse_prediction(item, payload) for item, payload in zip(body, payloads, strict=True)]

    def _request(self, path: str, payload: Any) -> Any:
        if time.monotonic() < self._circuit_open_until:
            logger.warning("NIR API circuit open until %.0f (monotonic)", self._circuit_open_until)
            raise NirApiError("NIR API circuit is open after repeated failures")
        last_error: Exception | None = None
        self._request_count += 1
        for attempt in range(3):
            start = time.monotonic()
            try:
                # Redact API key from headers in logs; do not log sensitive headers
                response = httpx.post(
                    f"{self.url}{path}",
                    json=payload,
                    headers={"X-API-Key": self.api_key or ""},
                    timeout=self.timeout,
                )
                latency = time.monotonic() - start
                response.raise_for_status()
                self._consecutive_failures = 0
                try:
                    body = response.json()
                except ValueError:
                    logger.exception(
                        "NIR API returned non-JSON response for path %s (status=%s) after %.3fs",
                        path,
                        response.status_code,
                        latency,
                    )
                    raise
                logger.debug(
                    "NIR API success path=%s status=%s latency=%.3fs attempt=%d payload_keys=%s",
                    path,
                    response.status_code,
                    latency,
                    attempt + 1,
                    list(payload.keys()) if isinstance(payload, dict) else None,
                )
                return body
            except (httpx.HTTPError, ValueError) as exc:
                latency = time.monotonic() - start
                last_error = exc
                logger.warning(
                    "NIR API request error path=%s attempt=%d latency=%.3fs error=%s",
                    path,
                    attempt + 1,
                    latency,
                    exc,
                )
                if attempt < 2:
                    time.sleep(2**attempt)
        # exhausted attempts
        self._consecutive_failures += 1
        if self._consecutive_failures >= 5:
            self._circuit_open_until = time.monotonic() + 3600
            logger.warning(
                "NIR API circuit opened due to %d consecutive failures; will remain open until %.0f (monotonic)",
                self._consecutive_failures,
                self._circuit_open_until,
            )
        logger.error(
            "NIR API request failed after 3 attempts; last_error=%s payload_keys=%s",
            last_error,
            list(payload.keys()) if isinstance(payload, dict) else None,
        )
        raise NirApiError(f"NIR API request failed after 3 attempts: {last_error}") from last_error

    def _parse_prediction(self, body: Any, payload: dict[str, Any]) -> NirPrediction:
        if not isinstance(body, dict):
            raise NirApiError("NIR API returned an invalid prediction response")
        try:
            nir = float(body["nir"])
            advice = str(body["advice"])
            urgency = str(body["urgency"]).upper()
            confidence = self._normalize_confidence(body.get("confidence"))
        except (KeyError, TypeError, ValueError) as exc:
            raise NirApiError("NIR API returned an invalid prediction response") from exc
        if not 0 <= nir <= 100 or urgency not in {"URGENT", "MODERATE", "SAFE"}:
            raise NirApiError("NIR API returned values outside the supported ranges")
        return NirPrediction(
            nir=nir,
            advice=advice,
            urgency=urgency,
            confidence=confidence,
            model_version=self.model_version_override or str(
                body.get("model_version") or body.get("version") or "nir-api-unknown"
            ),
            request=payload,
        )

    @staticmethod
    def _normalize_confidence(value: Any) -> float | None:
        """Normalize API confidence to the backend's 0..1 representation.

        Emits a debug/info log when a percentage-style confidence (0..100) is seen
        so operators can monitor how often upstream services return percentages
        instead of decimals.
        """
        if value is None:
            return None
        try:
            confidence = float(value)
        except (TypeError, ValueError) as exc:
            logger.debug("NIR API confidence could not be parsed: %r", value)
            raise NirApiError("NIR API returned an invalid confidence value") from exc
        if 0 <= confidence <= 1:
            return confidence
        if 1 < confidence <= 100:
            logger.info("Normalizing NIR API confidence from percentage %s to decimal", confidence)
            return confidence / 100
        logger.debug("NIR API returned out-of-range confidence: %s", confidence)
        raise NirApiError("NIR API returned an invalid confidence value")
