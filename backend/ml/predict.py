import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

def predict_anomaly(feature_dict):
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(ml_dir, 'models')

    scaler_path = os.path.join(models_dir, 'scaler.joblib')
    rf_path = os.path.join(models_dir, 'random_forest.joblib')
    iso_path = os.path.join(models_dir, 'isolation_forest.joblib')
    lof_path = os.path.join(models_dir, 'lof.joblib')

    if not (os.path.exists(scaler_path) and os.path.exists(rf_path)):
        return {"error": "Models not trained yet. Run train_models.py first."}

    scaler = joblib.load(scaler_path)
    rf_classifier = joblib.load(rf_path)
    iso_forest = joblib.load(iso_path)
    lof = joblib.load(lof_path) if os.path.exists(lof_path) else None

    feature_cols = [
        'price_z_score', 'ratio_to_estimate', 'bid_spread_variance',
        'single_bidder_flag', 'vendor_sole_bid_rate', 'win_rate_share',
        'rotation_index', 'relationship_density'
    ]

    # Fill missing features with default baseline values
    input_values = []
    for col in feature_cols:
        val = feature_dict.get(col, 0.0)
        input_values.append(float(val))

    X_sample = np.array([input_values])
    X_scaled = scaler.transform(X_sample)

    # Model Predictions
    rf_proba = float(rf_classifier.predict_proba(X_scaled)[0, 1])
    iso_score = float(iso_forest.decision_function(X_scaled)[0])
    iso_pred = int(iso_forest.predict(X_scaled)[0]) # -1 = anomaly, 1 = normal

    lof_pred = -1
    lof_score = -1.5
    if lof is not None:
        try:
            lof_score = float(lof.decision_function(X_scaled)[0])
            lof_pred = int(lof.predict(X_scaled)[0])
        except Exception:
            lof_pred = -1 if rf_proba > 0.5 else 1

    # Statistical Robust Z-score detector (Max deviation across key features)
    max_z = float(max(abs(input_values[0]), abs(input_values[1] - 1.0) * 3, input_values[6] * 3, input_values[7] * 3))
    stat_verdict = "High Anomaly" if max_z > 2.5 else ("Moderate Anomaly" if max_z > 1.2 else "Normal Baseline")

    # Multi-Model Agreement
    model_agreement = [
        {
            "model": "Random Forest Classifier",
            "verdict": "High Anomaly" if rf_proba >= 0.65 else ("Moderate Anomaly" if rf_proba >= 0.35 else "Normal Baseline"),
            "score": f"{round(rf_proba * 100, 1)}% Prob"
        },
        {
            "model": "Isolation Forest (Outlier)",
            "verdict": "High Anomaly" if iso_pred == -1 else "Normal Baseline",
            "score": f"Score: {round(iso_score, 3)}"
        },
        {
            "model": "Local Outlier Factor (LOF)",
            "verdict": "High Anomaly" if lof_pred == -1 else "Normal Baseline",
            "score": f"Density: {round(lof_score, 3)}"
        },
        {
            "model": "Robust Statistical Z-Score",
            "verdict": stat_verdict,
            "score": f"Max Z: {round(max_z, 2)}"
        }
    ]

    # Feature Importance Attribution Calculation
    importances = rf_classifier.feature_importances_
    attributions = []
    for i, col in enumerate(feature_cols):
        val = input_values[i]
        weight = float(importances[i])
        contribution = round(val * weight, 3)
        attributions.append({
            'feature': col,
            'val': val,
            'weight': weight,
            'contribution': contribution
        })

    attributions.sort(key=lambda x: abs(x['contribution']), reverse=True)

    risk_level = "Low"
    if rf_proba >= 0.65 or iso_pred == -1:
        risk_level = "High"
    elif rf_proba >= 0.35:
        risk_level = "Medium"

    return {
        "anomalyProbability": round(rf_proba, 4),
        "anomalyScorePct": int(round(rf_proba * 100)),
        "isolationScore": round(iso_score, 4),
        "isIsolationAnomaly": iso_pred == -1,
        "lofScore": round(lof_score, 4),
        "isLofAnomaly": lof_pred == -1,
        "riskLevel": risk_level,
        "modelAgreement": model_agreement,
        "topAttributions": attributions[:4]
    }

if __name__ == '__main__':
    if len(sys.argv) > 1:
        try:
            raw_input = sys.argv[1]
            data = json.loads(raw_input)
            result = predict_anomaly(data)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Default test prediction
        test_sample = {
            "price_z_score": 3.4,
            "ratio_to_estimate": 1.22,
            "bid_spread_variance": 0.005,
            "single_bidder_flag": 1,
            "vendor_sole_bid_rate": 0.85,
            "win_rate_share": 0.65,
            "rotation_index": 0.90,
            "relationship_density": 0.95
        }
        print(json.dumps(predict_anomaly(test_sample), indent=2))

