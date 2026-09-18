"""
Comprehensive backend test suite using FastAPI TestClient.
Verifies all 7 endpoints, error codes, and Pydantic validation.
"""
import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def run_tests():
    passed = 0
    failed = 0

    def assert_test(name: str, condition: bool, details: str = ""):
        nonlocal passed, failed
        if condition:
            print(f"  [PASS] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name} - {details}")
            failed += 1

    print("\n=======================================================")
    print("AXOM BACKEND ENDPOINT VERIFICATION")
    print("=======================================================")

    # 1. Health check
    print("\n1. Testing GET /api/health...")
    res = client.get("/api/health")
    assert_test("Health status 200", res.status_code == 200)
    data = res.json()
    assert_test("Health response body", data.get("status") == "ok" and "service" in data)

    # 2. Locations list
    print("\n2. Testing GET /api/locations...")
    res = client.get("/api/locations")
    assert_test("Locations status 200", res.status_code == 200)
    locations = res.json()
    assert_test("Locations count >= 8", isinstance(locations, list) and len(locations) >= 8)
    first_loc = locations[0]
    required_fields = ["id", "name", "state", "latitude", "longitude", "risk_score", "risk_level"]
    assert_test("Location summary fields present", all(f in first_loc for f in required_fields))

    # 3. Location detail & 404 handling
    print("\n3. Testing GET /api/locations/{location_id}...")
    res = client.get("/api/locations/east-khasi-hills")
    assert_test("Detail status 200", res.status_code == 200)
    detail = res.json()
    assert_test("Detail fields (recommendation, history)", "recommendation" in detail and len(detail.get("history", [])) > 0)

    res_404 = client.get("/api/locations/non-existent-site-12345")
    assert_test("Location 404 on invalid ID", res_404.status_code == 404)

    # 4. Transparent Risk Prediction (POST /api/risk/predict)
    print("\n4. Testing POST /api/risk/predict...")
    valid_risk_payload = {
        "rainfall": 120.0,
        "soil_saturation": 80.0,
        "slope": 35.0,
        "seismic_activity": 40.0,
        "vegetation_cover": 45.0,
    }
    res = client.post("/api/risk/predict", json=valid_risk_payload)
    assert_test("Risk predict status 200", res.status_code == 200)
    pred = res.json()
    assert_test("Risk score between 0 and 1", 0.0 <= pred.get("risk_score", -1) <= 1.0)
    assert_test("Risk tier classified", pred.get("risk_level") in ["LOW", "MODERATE", "HIGH", "CRITICAL"])
    assert_test("Factors array populated", len(pred.get("factors", [])) == 5)

    # Pydantic validation error check (rainfall < 0)
    res_invalid = client.post("/api/risk/predict", json={"rainfall": -10.0, "soil_saturation": 80.0, "slope": 30.0, "seismic_activity": 20.0})
    assert_test("Validation error returns 422", res_invalid.status_code == 422)

    # 5. ML Random Forest Prediction (POST /api/ml/predict)
    print("\n5. Testing POST /api/ml/predict...")
    res_ml = client.post("/api/ml/predict", json=valid_risk_payload)
    assert_test("ML predict status 200", res_ml.status_code == 200)
    ml_pred = res_ml.json()
    assert_test("Predicted class present", ml_pred.get("predicted_class") in ["LOW", "MODERATE", "HIGH", "CRITICAL"])
    assert_test("Probabilities distribution", len(ml_pred.get("probabilities", {})) == 4)
    assert_test("Feature importances returned", len(ml_pred.get("feature_importances", {})) == 5)
    assert_test("Scientific notice present", "notice" in ml_pred)

    # 6. Alerts (GET /api/alerts & POST /api/alerts/{id}/acknowledge)
    print("\n6. Testing Alerts API...")
    res_alerts = client.get("/api/alerts")
    assert_test("Alerts status 200", res_alerts.status_code == 200)
    alerts = res_alerts.json()
    assert_test("Alerts array populated", isinstance(alerts, list) and len(alerts) > 0)

    # Acknowledge alert-01
    res_ack = client.post("/api/alerts/alert-01/acknowledge")
    assert_test("Acknowledge status 200", res_ack.status_code == 200)
    ack_data = res_ack.json()
    assert_test("Alert status updated to acknowledged", ack_data.get("alert", {}).get("status") == "acknowledged")

    res_ack_404 = client.post("/api/alerts/unknown-alert-999/acknowledge")
    assert_test("Alert 404 on invalid ID", res_ack_404.status_code == 404)

    # 7. Analytics Summary (GET /api/analytics/summary)
    print("\n7. Testing GET /api/analytics/summary...")
    res_analytics = client.get("/api/analytics/summary")
    assert_test("Analytics status 200", res_analytics.status_code == 200)
    analytics = res_analytics.json()
    assert_test("Monitored sites count present", analytics.get("monitored_sites") == 24)
    assert_test("24h risk trend points present", len(analytics.get("risk_trend_24h", [])) == 24)
    assert_test("Factor weights present", len(analytics.get("environmental_factors", [])) > 0)
    assert_test("Model stats present", len(analytics.get("model_stats", [])) > 0)

    print("\n=======================================================")
    print(f"TEST SUMMARY: {passed} PASSED, {failed} FAILED")
    print("=======================================================\n")

    return failed == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
