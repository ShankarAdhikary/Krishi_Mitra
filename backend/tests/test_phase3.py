"""Tests for Phase 3: ML Prediction Service."""


def test_prediction_nonexistent_plot(client):
    """Test prediction for nonexistent plot returns 404."""
    response = client.post("/predictions/irrigation-stress/nonexistent-plot-id")
    assert response.status_code == 404


def test_explain_nonexistent_prediction(client):
    """Test explanation for nonexistent prediction returns 404."""
    response = client.get("/predictions/explain/nonexistent-prediction-id")
    assert response.status_code == 404


def test_get_latest_nonexistent_plot(client):
    """Test latest prediction for nonexistent plot returns 404."""
    response = client.get("/predictions/latest/nonexistent-plot-id")
    assert response.status_code == 404

