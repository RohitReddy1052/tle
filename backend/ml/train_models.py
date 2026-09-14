import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.neighbors import LocalOutlierFactor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def train_and_export_models():
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(ml_dir, 'dataset.csv')
    models_dir = os.path.join(ml_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    # 1. Load Dataset
    if not os.path.exists(csv_path):
        from dataset_generator import generate_procurement_dataset
        generate_procurement_dataset()

    df = pd.read_csv(csv_path)
    
    feature_cols = [
        'price_z_score', 'ratio_to_estimate', 'bid_spread_variance',
        'single_bidder_flag', 'vendor_sole_bid_rate', 'win_rate_share',
        'rotation_index', 'relationship_density'
    ]
    
    X = df[feature_cols]
    y = df['is_anomaly']

    # 2. Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    # 3. Standard Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 4. Model 1: Isolation Forest (Unsupervised Anomaly)
    iso_forest = IsolationForest(n_estimators=100, contamination=0.18, random_state=42)
    iso_forest.fit(X_train_scaled)

    # 5. Model 2: Local Outlier Factor (LOF - Unsupervised Density)
    lof = LocalOutlierFactor(n_neighbors=20, novelty=True, contamination=0.18)
    lof.fit(X_train_scaled)

    # 6. Model 3: Random Forest Classifier (Supervised Probability)
    rf_classifier = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    rf_classifier.fit(X_train_scaled, y_train)

    # 7. Evaluation Metrics
    y_pred = rf_classifier.predict(X_test_scaled)
    y_proba = rf_classifier.predict_proba(X_test_scaled)[:, 1]

    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred))
    recall = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    roc_auc = float(roc_auc_score(y_test, y_proba))

    # Feature Importance Rankings
    importances = rf_classifier.feature_importances_
    feature_importance_dict = [
        {'feature': col, 'importance': round(float(imp), 4)}
        for col, imp in sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    ]

    # 8. Save Model Artifacts
    joblib.dump(scaler, os.path.join(models_dir, 'scaler.joblib'))
    joblib.dump(iso_forest, os.path.join(models_dir, 'isolation_forest.joblib'))
    joblib.dump(lof, os.path.join(models_dir, 'lof.joblib'))
    joblib.dump(rf_classifier, os.path.join(models_dir, 'random_forest.joblib'))

    metadata = {
        'status': 'trained',
        'samplesCount': len(df),
        'anomalyRatio': float(y.mean()),
        'metrics': {
            'accuracy': round(accuracy, 4),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1Score': round(f1, 4),
            'rocAucScore': round(roc_auc, 4)
        },
        'modelsTrained': ['RandomForestClassifier', 'IsolationForest', 'LocalOutlierFactor'],
        'featureImportances': feature_importance_dict,
        'featuresList': feature_cols
    }

    metadata_path = os.path.join(models_dir, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print("=========================================================")
    print("  Machine Learning Suite Successfully Trained & Saved!")
    print(f"  Models: RandomForest, IsolationForest, LocalOutlierFactor")
    print(f"  Accuracy:  {accuracy * 100:.2f}% | ROC-AUC: {roc_auc:.4f}")
    print(f"  Precision: {precision * 100:.2f}% | Recall:  {recall * 100:.2f}%")
    print(f"  Saved artifacts to: {models_dir}")
    print("=========================================================")
    return metadata

if __name__ == '__main__':
    train_and_export_models()

