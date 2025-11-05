"""
Smart Factory Analytics - Power BI Report Generator
Generates CSV reports for Power BI integration and analysis.
"""

import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from sklearn.preprocessing import StandardScaler

# Paths
DATA_PATH = "data/factory_sensors.csv"
MODEL_DIR = "backend/ml/"
OUTPUT_DIR = "reports/"

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_models():
    """Load trained ML models and scalers."""
    print("📦 Loading trained models...")
    
    models = {
        'failure_model': joblib.load(f"{MODEL_DIR}failure_model.pkl"),
        'failure_scaler': joblib.load(f"{MODEL_DIR}failure_scaler.pkl"),
        'failure_features': joblib.load(f"{MODEL_DIR}failure_features.pkl"),
        'yield_model': joblib.load(f"{MODEL_DIR}yield_model.pkl"),
        'yield_scaler': joblib.load(f"{MODEL_DIR}yield_scaler.pkl"),
        'yield_features': joblib.load(f"{MODEL_DIR}yield_features.pkl"),
        'anomaly_model': joblib.load(f"{MODEL_DIR}anomaly_model.pkl"),
        'anomaly_scaler': joblib.load(f"{MODEL_DIR}anomaly_scaler.pkl"),
        'anomaly_features': joblib.load(f"{MODEL_DIR}anomaly_features.pkl"),
    }
    
    print("✅ Models loaded successfully")
    return models

def feature_engineering(df):
    """Create features matching the training pipeline."""
    print("🔧 Engineering features...")
    
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(['machine_id', 'timestamp']).reset_index(drop=True)
    
    # Time-based features
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['day_of_month'] = df['timestamp'].dt.day
    
    # Lag features
    for col in ['temperature', 'vibration', 'pressure', 'speed']:
        df[f'{col}_lag1'] = df.groupby('machine_id')[col].shift(1)
        df[f'{col}_change'] = df.groupby('machine_id')[col].diff()
    
    # Rolling statistics
    for col in ['temperature', 'vibration', 'pressure']:
        df[f'{col}_rolling_mean'] = df.groupby('machine_id')[col].rolling(12).mean().reset_index(0, drop=True)
        df[f'{col}_rolling_std'] = df.groupby('machine_id')[col].rolling(12).std().reset_index(0, drop=True)
    
    # Interaction features
    df['temp_vibration_interaction'] = df['temperature'] * df['vibration']
    df['pressure_speed_ratio'] = df['pressure'] / (df['speed'] + 1)
    
    # Fill NaN
    df = df.fillna(method='bfill').fillna(0)
    
    return df

def generate_failure_predictions_report(df, models):
    """Generate failure prediction report for Power BI."""
    print("\n📊 Generating Failure Predictions Report...")
    
    # Prepare features
    X = df[models['failure_features']]
    X_scaled = models['failure_scaler'].transform(X)
    
    # Predict
    df['failure_probability'] = models['failure_model'].predict_proba(X_scaled)[:, 1]
    
    # Aggregate by machine
    failure_report = df.groupby('machine_id').agg({
        'failure_probability': 'mean',
        'runtime_hours': 'max',
        'temperature': 'mean',
        'vibration': 'mean',
        'pressure': 'mean',
        'speed': 'mean',
        'is_failure': 'sum'
    }).reset_index()
    
    failure_report.columns = [
        'machine_id', 'failure_probability', 'runtime_hours',
        'avg_temperature', 'avg_vibration', 'avg_pressure', 'avg_speed',
        'total_failures'
    ]
    
    # Risk categorization
    failure_report['risk_level'] = pd.cut(
        failure_report['failure_probability'],
        bins=[0, 0.3, 0.7, 1.0],
        labels=['Low', 'Medium', 'High']
    )
    
    # Calculate maintenance priority
    failure_report['maintenance_priority'] = (
        failure_report['failure_probability'] * 100
    ).round(0).astype(int)
    
    # Add recommendations
    def get_recommendation(row):
        if row['failure_probability'] > 0.7:
            return "URGENT: Schedule immediate maintenance"
        elif row['failure_probability'] > 0.4:
            return "WARNING: Plan maintenance within 48 hours"
        else:
            return "NORMAL: Continue regular monitoring"
    
    failure_report['recommendation'] = failure_report.apply(get_recommendation, axis=1)
    
    # Sort by priority
    failure_report = failure_report.sort_values('failure_probability', ascending=False)
    
    # Save report
    output_path = f"{OUTPUT_DIR}failure_predictions.csv"
    failure_report.to_csv(output_path, index=False)
    
    print(f"✅ Saved: {output_path}")
    print(f"   High Risk Machines: {(failure_report['risk_level'] == 'High').sum()}")
    print(f"   Medium Risk Machines: {(failure_report['risk_level'] == 'Medium').sum()}")
    print(f"   Low Risk Machines: {(failure_report['risk_level'] == 'Low').sum()}")
    
    return failure_report

def generate_yield_performance_report(df, models):
    """Generate yield performance report for Power BI."""
    print("\n📈 Generating Yield Performance Report...")
    
    # Prepare features
    X = df[models['yield_features']]
    X_scaled = models['yield_scaler'].transform(X)
    
    # Predict
    df['predicted_yield'] = models['yield_model'].predict(X_scaled)
    
    # Aggregate by machine
    yield_report = df.groupby('machine_id').agg({
        'predicted_yield': 'mean',
        'temperature': 'mean',
        'vibration': 'mean',
        'pressure': 'mean',
        'speed': 'mean',
        'runtime_hours': 'max'
    }).reset_index()
    
    yield_report.columns = [
        'machine_id', 'predicted_yield', 'avg_temperature',
        'avg_vibration', 'avg_pressure', 'avg_speed', 'runtime_hours'
    ]
    
    # Calculate efficiency percentage
    yield_report['yield_efficiency_%'] = np.clip(yield_report['predicted_yield'], 0, 100).round(2)
    
    # Performance categorization
    yield_report['performance_level'] = pd.cut(
        yield_report['yield_efficiency_%'],
        bins=[0, 70, 85, 100],
        labels=['Poor', 'Good', 'Excellent']
    )
    
    # Calculate optimization potential
    yield_report['optimization_potential_%'] = (
        100 - yield_report['yield_efficiency_%']
    ).round(2)
    
    # Add recommendations
    def get_yield_recommendation(row):
        if row['yield_efficiency_%'] < 70:
            return "CRITICAL: Investigate process inefficiencies"
        elif row['yield_efficiency_%'] < 85:
            return "OPTIMIZE: Fine-tune operational parameters"
        else:
            return "EXCELLENT: Maintain current performance"
    
    yield_report['recommendation'] = yield_report.apply(get_yield_recommendation, axis=1)
    
    # Sort by efficiency
    yield_report = yield_report.sort_values('yield_efficiency_%', ascending=False)
    
    # Save report
    output_path = f"{OUTPUT_DIR}yield_performance.csv"
    yield_report.to_csv(output_path, index=False)
    
    print(f"✅ Saved: {output_path}")
    print(f"   Average Yield Efficiency: {yield_report['yield_efficiency_%'].mean():.2f}%")
    print(f"   Top Performer: {yield_report.iloc[0]['machine_id']} ({yield_report.iloc[0]['yield_efficiency_%']:.2f}%)")
    print(f"   Needs Attention: {yield_report.iloc[-1]['machine_id']} ({yield_report.iloc[-1]['yield_efficiency_%']:.2f}%)")
    
    return yield_report

def generate_anomaly_clusters_report(df, models):
    """Generate anomaly detection report for Power BI."""
    print("\n🔍 Generating Anomaly Clusters Report...")
    
    # Prepare features
    X = df[models['anomaly_features']]
    X_scaled = models['anomaly_scaler'].transform(X)
    
    # Predict clusters
    df['cluster'] = models['anomaly_model'].predict(X_scaled)
    
    # Cluster-level statistics
    anomaly_report = df.groupby('cluster').agg({
        'temperature': ['mean', 'std'],
        'vibration': ['mean', 'std'],
        'pressure': ['mean', 'std'],
        'speed': ['mean', 'std'],
        'is_failure': 'mean',
        'machine_id': 'count'
    })
    
    # Flatten column names
    anomaly_report.columns = [
        'avg_temperature', 'std_temperature',
        'avg_vibration', 'std_vibration',
        'avg_pressure', 'std_pressure',
        'avg_speed', 'std_speed',
        'failure_rate', 'machines_in_cluster'
    ]
    
    anomaly_report = anomaly_report.reset_index()
    
    # Calculate anomaly score (higher failure rate = more anomalous)
    anomaly_report['anomaly_score'] = (anomaly_report['failure_rate'] * 100).round(2)
    
    # Categorize clusters
    anomaly_report['cluster_type'] = pd.cut(
        anomaly_report['anomaly_score'],
        bins=[0, 2, 5, 100],
        labels=['Normal', 'Warning', 'Critical']
    )
    
    # Add cluster names
    cluster_names = {
        0: 'Cluster A - Normal Operation',
        1: 'Cluster B - Elevated Vibration',
        2: 'Cluster C - High Temperature',
        3: 'Cluster D - Critical Conditions'
    }
    anomaly_report['cluster_name'] = anomaly_report['cluster'].map(
        lambda x: cluster_names.get(x, f'Cluster {x}')
    )
    
    # Sort by anomaly score
    anomaly_report = anomaly_report.sort_values('anomaly_score', ascending=False)
    
    # Save report
    output_path = f"{OUTPUT_DIR}anomaly_clusters.csv"
    anomaly_report.to_csv(output_path, index=False)
    
    print(f"✅ Saved: {output_path}")
    print(f"   Total Clusters: {len(anomaly_report)}")
    print(f"   Most Critical: {anomaly_report.iloc[0]['cluster_name']} (Score: {anomaly_report.iloc[0]['anomaly_score']:.2f})")
    
    return anomaly_report

def generate_machine_health_report(df, models):
    """Generate comprehensive machine health report."""
    print("\n⚙️  Generating Machine Health Report...")
    
    # Get latest reading per machine
    latest_readings = df.groupby('machine_id').tail(1).reset_index(drop=True)
    
    # Prepare features for all models
    X_failure = latest_readings[models['failure_features']]
    X_failure_scaled = models['failure_scaler'].transform(X_failure)
    
    X_yield = latest_readings[models['yield_features']]
    X_yield_scaled = models['yield_scaler'].transform(X_yield)
    
    X_anomaly = latest_readings[models['anomaly_features']]
    X_anomaly_scaled = models['anomaly_scaler'].transform(X_anomaly)
    
    # Predictions
    latest_readings['failure_probability'] = models['failure_model'].predict_proba(X_failure_scaled)[:, 1]
    latest_readings['predicted_yield'] = models['yield_model'].predict(X_yield_scaled)
    latest_readings['cluster'] = models['anomaly_model'].predict(X_anomaly_scaled)
    
    # Calculate health score (0-100)
    latest_readings['health_score'] = (
        (1 - latest_readings['failure_probability']) * 50 +  # 50% weight
        (latest_readings['predicted_yield'] / 100) * 50       # 50% weight
    ) * 100
    latest_readings['health_score'] = latest_readings['health_score'].clip(0, 100).round(2)
    
    # Health status
    latest_readings['health_status'] = pd.cut(
        latest_readings['health_score'],
        bins=[0, 50, 75, 100],
        labels=['Critical', 'Fair', 'Good']
    )
    
    # Select relevant columns
    health_report = latest_readings[[
        'machine_id', 'timestamp', 'health_score', 'health_status',
        'failure_probability', 'predicted_yield', 'cluster',
        'temperature', 'vibration', 'pressure', 'speed', 'runtime_hours'
    ]].copy()
    
    # Sort by health score
    health_report = health_report.sort_values('health_score', ascending=True)
    
    # Save report
    output_path = f"{OUTPUT_DIR}machine_health_overview.csv"
    health_report.to_csv(output_path, index=False)
    
    print(f"✅ Saved: {output_path}")
    print(f"   Average Health Score: {health_report['health_score'].mean():.2f}")
    print(f"   Machines in Good Health: {(health_report['health_status'] == 'Good').sum()}")
    print(f"   Machines Needing Attention: {(health_report['health_status'] == 'Critical').sum()}")
    
    return health_report

def main():
    """Main report generation pipeline."""
    print("="*80)
    print("📊 SMART FACTORY ANALYTICS - POWER BI REPORT GENERATOR")
    print("="*80)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Load data
    print("📂 Loading sensor data...")
    df = pd.read_csv(DATA_PATH)
    print(f"✅ Loaded {len(df):,} samples")
    
    # Feature engineering
    df = feature_engineering(df)
    
    # Load models
    models = load_models()
    
    # Generate all reports
    failure_report = generate_failure_predictions_report(df, models)
    yield_report = generate_yield_performance_report(df, models)
    anomaly_report = generate_anomaly_clusters_report(df, models)
    health_report = generate_machine_health_report(df, models)
    
    print("\n" + "="*80)
    print("🎉 ALL REPORTS GENERATED SUCCESSFULLY!")
    print("="*80)
    print(f"📁 Reports saved in: {OUTPUT_DIR}")
    print(f"⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n📋 Generated Reports:")
    print(f"   1. {OUTPUT_DIR}failure_predictions.csv")
    print(f"   2. {OUTPUT_DIR}yield_performance.csv")
    print(f"   3. {OUTPUT_DIR}anomaly_clusters.csv")
    print(f"   4. {OUTPUT_DIR}machine_health_overview.csv")
    print("\n💡 Import these CSV files into Power BI for advanced visualization!")
    print("="*80)

if __name__ == "__main__":
    main()
