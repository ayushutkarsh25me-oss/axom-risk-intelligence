"""
AXOM Machine Learning Risk Prediction Component
------------------------------------------------
Architecture: scikit-learn RandomForestClassifier (100 ensemble decision trees)

Training data policy:
- Production path: load a persisted artifact if present.
- Demo path: calibrate on synthetic samples inspired by GSI / IMD ranges.
  Synthetic training is isolated in train_synthetic_baseline() and is never
  mixed with live field observations (none are ingested in this prototype).
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

from app.config import settings

logger = logging.getLogger("axom.ml")

CLASSES = ["LOW", "MODERATE", "HIGH", "CRITICAL"]
FEATURE_NAMES = ["rainfall", "soil_saturation", "slope", "seismic_activity", "vegetation_cover"]

DEFAULT_ARTIFACT = Path(__file__).resolve().parent / "artifacts" / "baseline_rf.joblib"


def _artifact_path() -> Path:
    if settings.ML_MODEL_PATH.strip():
        return Path(settings.ML_MODEL_PATH)
    return DEFAULT_ARTIFACT


class LandslideRiskMLModel:
    """Random Forest Classifier prototype for landslide risk assessment."""

    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            random_state=42,
            class_weight="balanced",
        )
        self.feature_names = FEATURE_NAMES
        self.classes_ = CLASSES
        self.is_trained = False
        self.training_source = "untrained"
        self._feature_importances: Dict[str, float] = {}

    def ensure_ready(self) -> None:
        if self.is_trained:
            return
        if self.load():
            return
        self.train_synthetic_baseline(persist=True)

    def load(self) -> bool:
        path = _artifact_path()
        if not path.exists():
            return False
        try:
            payload = joblib.load(path)
            self.model = payload["model"]
            self._feature_importances = payload.get("feature_importances", {})
            self.training_source = payload.get("training_source", "persisted_artifact")
            self.is_trained = True
            logger.info("Loaded persisted Random Forest from %s", path)
            return True
        except Exception as exc:
            logger.warning("Could not load ML artifact (%s). Will retrain.", exc)
            return False

    def persist(self) -> None:
        path = _artifact_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {
                "model": self.model,
                "feature_importances": self._feature_importances,
                "training_source": self.training_source,
                "feature_names": self.feature_names,
            },
            path,
        )
        logger.info("Persisted Random Forest to %s", path)

    def train_baseline(self, num_samples: int = 1500) -> None:
        """Backward-compatible alias used at startup."""
        self.train_synthetic_baseline(num_samples=num_samples, persist=True)

    def train_synthetic_baseline(self, num_samples: int = 1500, persist: bool = True) -> None:
        """
        Calibrates the baseline Random Forest using physically grounded parameter ranges
        typical of Himalayan / North-Eastern Indian terrain. SYNTHETIC ONLY.
        """
        logger.info("Calibrating synthetic baseline Random Forest on %s samples...", num_samples)
        rng = np.random.RandomState(42)

        rainfall = np.clip(rng.exponential(scale=70, size=num_samples), 0.0, 350.0)
        soil_sat = rng.uniform(15.0, 100.0, size=num_samples)
        slope = rng.uniform(5.0, 55.0, size=num_samples)
        seismic = rng.uniform(5.0, 85.0, size=num_samples)
        vegetation = rng.uniform(15.0, 85.0, size=num_samples)

        X = np.column_stack([rainfall, soil_sat, slope, seismic, vegetation])

        rf_norm = rainfall / 250.0
        soil_norm = soil_sat / 100.0
        slope_norm = slope / 50.0
        seismic_norm = seismic / 100.0
        veg_norm = vegetation / 100.0

        score = np.clip(
            rf_norm * 0.35
            + soil_norm * 0.28
            + slope_norm * 0.22
            + seismic_norm * 0.17
            - veg_norm * 0.12
            + rng.normal(0, 0.04, size=num_samples),
            0.0,
            1.0,
        )

        y = np.empty(num_samples, dtype=object)
        for i, s in enumerate(score):
            if s >= 0.78:
                y[i] = "CRITICAL"
            elif s >= 0.58:
                y[i] = "HIGH"
            elif s >= 0.38:
                y[i] = "MODERATE"
            else:
                y[i] = "LOW"

        self.model.fit(X, y)
        self.is_trained = True
        self.training_source = "synthetic_gsi_imd_baseline"
        self._feature_importances = {
            name: round(float(imp), 4)
            for name, imp in zip(self.feature_names, self.model.feature_importances_)
        }
        logger.info("Synthetic model calibrated. Feature importances: %s", self._feature_importances)
        if persist:
            self.persist()

    def predict(
        self,
        rainfall: float,
        soil_saturation: float,
        slope: float,
        seismic_activity: float,
        vegetation_cover: float = 50.0,
    ) -> Dict[str, Any]:
        self.ensure_ready()

        x = np.array([[rainfall, soil_saturation, slope, seismic_activity, vegetation_cover]], dtype=float)
        predicted_class = str(self.model.predict(x)[0])
        probabilities_array = self.model.predict_proba(x)[0]

        prob_dict: Dict[str, float] = {}
        for cls_name, prob in zip(self.model.classes_, probabilities_array):
            prob_dict[str(cls_name)] = round(float(prob), 4)

        class_weights = {"LOW": 0.15, "MODERATE": 0.45, "HIGH": 0.72, "CRITICAL": 0.92}
        expected_score = sum(prob_dict.get(c, 0.0) * class_weights.get(c, 0.0) for c in CLASSES)
        expected_score = max(0.02, min(0.98, expected_score))
        confidence = float(np.max(probabilities_array))

        return {
            "predicted_class": predicted_class,
            "risk_score": round(expected_score, 2),
            "confidence": round(confidence, 2),
            "probabilities": prob_dict,
            "feature_importances": self._feature_importances,
            "training_source": self.training_source,
        }


ml_model = LandslideRiskMLModel()
