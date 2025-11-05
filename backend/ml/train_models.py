"""
Smart Factory Analytics - ML Model Training Pipeline
Trains predictive maintenance, yield optimization, and anomaly detection models.
"""

import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    mean_absolute_error, mean_squared_error, r2_score,
    silhouette_score
)
import matplotlib.pyplot as plt
import seaborn as sns

# Paths
DATA_PATH = "data/factory_sensors.csv"
MODEL_DIR = "backend/ml/"
os.makedirs(MODEL_DIR, exist_ok=True)

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')

def load_and_preprocess_data():
    """Load and preprocess sensor data."""
    print("📂 Loading sensor data...")
    df = pd.read_csv(DATA_PATH)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(['machine_id', 'timestamp']).reset_index(drop=True)
    
    print(f"✅ Loaded {len(df):,} samples from {df['machine_id'].nunique()} machines")
    return df

def feature_engineering(df):
    """Create advanced features for ML models."""
    print("🔧 Engineering features...")
    
    # Time-based features
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['day_of_month'] = df['timestamp'].dt.day
    
    # Lag features (previous readings)
    for col in ['temperature', 'vibration', 'pressure', 'speed']:
        df[f'{col}_lag1'] = df.groupby('machine_id')[col].shift(1)
        df[f'{col}_change'] = df.groupby('machine_id')[col].diff()
    
    # Rolling statistics (12 samples = 1 hour)
    for col in ['temperature', 'vibration', 'pressure']:
        df[f'{col}_rolling_mean'] = df.groupby('machine_id')[col].rolling(12).mean().reset_index(0, drop=True)
        df[f'{col}_rolling_std'] = df.groupby('machine_id')[col].rolling(12).std().reset_index(0, drop=True)
    
    # Interaction features
    df['temp_vibration_interaction'] = df['temperature'] * df['vibration']
    df['pressure_speed_ratio'] = df['pressure'] / (df['speed'] + 1)
    
    # Fill NaN values created by lag/rolling operations
    df = df.fillna(method='bfill').fillna(0)
    
    print(f"✅ Created {df.shape[1]} features")
    return df

def train_failure_prediction_model(df):
    """Train Random Forest Classifier for failure prediction."""
    print("\n" + "="*80)
    print("🎯 TRAINING FAILURE PREDICTION MODEL")
    print("="*80)
    
    # Feature selection
    feature_cols = [
        'temperature', 'vibration', 'pressure', 'speed', 'runtime_hours',
        'temperature_change', 'vibration_change', 'pressure_change',
        'temperature_rolling_mean', 'vibration_rolling_mean', 'pressure_rolling_mean',
        'temperature_rolling_std', 'vibration_rolling_std', 'pressure_rolling_std',
        'temp_vibration_interaction', 'pressure_speed_ratio', 'hour'
    ]
    
    X = df[feature_cols]
    y = df['is_failure']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"📊 Training samples: {len(X_train):,}, Test samples: {len(X_test):,}")
    print(f"⚠️  Failure rate: {y_train.mean()*100:.2f}%")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("🔄 Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    # Evaluation
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {accuracy*100:.2f}%")
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Failure', 'Failure']))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🔝 Top 10 Important Features:")
    print(feature_importance.head(10).to_string(index=False))
    
    # Save model and scaler
    joblib.dump(model, f"{MODEL_DIR}failure_model.pkl")
    joblib.dump(scaler, f"{MODEL_DIR}failure_scaler.pkl")
    joblib.dump(feature_cols, f"{MODEL_DIR}failure_features.pkl")
    
    print(f"\n💾 Model saved to {MODEL_DIR}failure_model.pkl")
    return model, scaler, feature_cols

def train_yield_prediction_model(df):
    """Train Random Forest Regressor for yield optimization."""
    print("\n" + "="*80)
    print("📈 TRAINING YIELD PREDICTION MODEL")
    print("="*80)
    
    # Simulate yield data based on sensor readings
    # Higher yield correlates with optimal temperature, low vibration, stable pressure
    df['yield'] = (
        100 - 
        ((df['temperature'] - 70).abs() * 0.5) -  # Optimal at 70°C
        (df['vibration'] * 10) -  # Lower vibration = better yield
        ((df['pressure'] - 100).abs() * 0.2) -  # Optimal at 100 PSI
        (df['is_failure'] * 50)  # Failures drastically reduce yield
    )
    df['yield'] = df['yield'].clip(0, 100)
    
    # Feature selection
    feature_cols = [
        'temperature', 'vibration', 'pressure', 'speed', 'runtime_hours',
        'temperature_change', 'vibration_change', 'pressure_change',
        'temperature_rolling_mean', 'vibration_rolling_mean', 'pressure_rolling_mean',
        'temp_vibration_interaction', 'pressure_speed_ratio'
    ]
    
    X = df[feature_cols]
    y = df['yield']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"📊 Training samples: {len(X_train):,}, Test samples: {len(X_test):,}")
    print(f"📈 Average yield: {y_train.mean():.2f}%")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("🔄 Training Random Forest Regressor...")
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred = model.predict(X_test_scaled)
    
    # Evaluation
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n✅ Model Performance:")
    print(f"   MAE:  {mae:.2f}%")
    print(f"   RMSE: {rmse:.2f}%")
    print(f"   R²:   {r2:.4f}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🔝 Top 10 Important Features:")
    print(feature_importance.head(10).to_string(index=False))
    
    # Save model and scaler
    joblib.dump(model, f"{MODEL_DIR}yield_model.pkl")
    joblib.dump(scaler, f"{MODEL_DIR}yield_scaler.pkl")
    joblib.dump(feature_cols, f"{MODEL_DIR}yield_features.pkl")
    
    print(f"\n💾 Model saved to {MODEL_DIR}yield_model.pkl")
    return model, scaler, feature_cols

def train_anomaly_detection_model(df):
    """Train K-Means clustering for anomaly detection."""
    print("\n" + "="*80)
    print("🔍 TRAINING ANOMALY DETECTION MODEL")
    print("="*80)
    
    # Feature selection
    feature_cols = [
        'temperature', 'vibration', 'pressure', 'speed',
        'temperature_change', 'vibration_change', 'pressure_change',
        'temperature_rolling_std', 'vibration_rolling_std', 'pressure_rolling_std'
    ]
    
    X = df[feature_cols]
    
    print(f"📊 Total samples: {len(X):,}")
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train K-Means
    print("🔄 Training K-Means Clustering...")
    n_clusters = 4  # Normal, Warning, Critical, Failure
    model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = model.fit_predict(X_scaled)
    
    # Evaluation
    silhouette = silhouette_score(X_scaled, clusters)
    print(f"\n✅ Silhouette Score: {silhouette:.4f}")
    
    # Cluster statistics
    df['cluster'] = clusters
    print("\n📊 Cluster Distribution:")
    cluster_stats = df.groupby('cluster').agg({
        'temperature': 'mean',
        'vibration': 'mean',
        'pressure': 'mean',
        'is_failure': 'mean',
        'machine_id': 'count'
    }).rename(columns={'machine_id': 'count'})
    cluster_stats['failure_rate_%'] = cluster_stats['is_failure'] * 100
    print(cluster_stats)
    
    # Save model and scaler
    joblib.dump(model, f"{MODEL_DIR}anomaly_model.pkl")
    joblib.dump(scaler, f"{MODEL_DIR}anomaly_scaler.pkl")
    joblib.dump(feature_cols, f"{MODEL_DIR}anomaly_features.pkl")
    
    print(f"\n💾 Model saved to {MODEL_DIR}anomaly_model.pkl")
    return model, scaler, feature_cols

def main():
    """Main training pipeline."""
    print("="*80)
    print("🏭 SMART FACTORY ANALYTICS - ML MODEL TRAINING")
    print("="*80)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Load and preprocess
    df = load_and_preprocess_data()
    df = feature_engineering(df)
    
    # Train all models
    failure_model, failure_scaler, failure_features = train_failure_prediction_model(df)
    yield_model, yield_scaler, yield_features = train_yield_prediction_model(df)
    anomaly_model, anomaly_scaler, anomaly_features = train_anomaly_detection_model(df)
    
    print("\n" + "="*80)
    print("🎉 ALL MODELS TRAINED SUCCESSFULLY!")
    print("="*80)
    print(f"📁 Models saved in: {MODEL_DIR}")
    print(f"⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n🎯 Next steps:")
    print("   1. Run: python generate_reports.py (to generate Power BI reports)")
    print("   2. Start backend: cd backend && uvicorn main:app --reload")
    print("   3. Start frontend: cd frontend && npm run dev")
    print("="*80)

if __name__ == "__main__":
    main()
