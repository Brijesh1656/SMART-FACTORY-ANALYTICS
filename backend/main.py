"""
Smart Factory Analytics - FastAPI Backend
Provides ML-powered endpoints for predictive maintenance and analytics.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
import subprocess

# Initialize FastAPI
app = FastAPI(
    title="Smart Factory Analytics API",
    description="Predictive Maintenance & Yield Optimization Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
DATA_PATH = "../data/factory_sensors.csv"
MODEL_DIR = "ml/"

# Global model storage
models = {}

def load_models():
    """Load all trained models."""
    global models
    try:
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
        return True
    except Exception as e:
        print(f"Error loading models: {e}")
        return False

# Load models on startup
@app.on_event("startup")
async def startup_event():
    """Load models when API starts."""
    success = load_models()
    if success:
        print("✅ Models loaded successfully")
    else:
        print("⚠️  Warning: Models not found. Run train_models.py first.")

def feature_engineering(df):
    """Create features for predictions."""
    df = df.sort_values(['machine_id', 'timestamp']).reset_index(drop=True)
    
    # Time-based features
    df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
    
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

# Pydantic models
class SensorData(BaseModel):
    machine_id: str
    temperature: float
    vibration: float
    pressure: float
    speed: float
    runtime_hours: float

class FailurePrediction(BaseModel):
    machine_id: str
    failure_probability: float
    risk_level: str
    recommendation: str

class YieldPrediction(BaseModel):
    machine_id: str
    predicted_yield: float
    efficiency_percentage: float
    performance_level: str

class AnomalyResult(BaseModel):
    machine_id: str
    cluster: int
    cluster_name: str
    is_anomalous: bool

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Smart Factory Analytics API",
        "version": "1.0.0",
        "status": "operational",
        "models_loaded": len(models) > 0
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(models) > 0
    }

@app.get("/predict_failure")
async def predict_failure():
    """Predict failure probability for all machines."""
    try:
        if not models:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        # Load data
        df = pd.read_csv(DATA_PATH)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = feature_engineering(df)
        
        # Get latest reading per machine
        latest = df.groupby('machine_id').tail(1).reset_index(drop=True)
        
        # Prepare features
        X = latest[models['failure_features']]
        X_scaled = models['failure_scaler'].transform(X)
        
        # Predict
        probabilities = models['failure_model'].predict_proba(X_scaled)[:, 1]
        
        # Build response
        predictions = []
        for idx, row in latest.iterrows():
            prob = float(probabilities[idx])
            
            if prob > 0.7:
                risk = "High"
                rec = "URGENT: Schedule immediate maintenance"
            elif prob > 0.4:
                risk = "Medium"
                rec = "WARNING: Plan maintenance within 48 hours"
            else:
                risk = "Low"
                rec = "NORMAL: Continue regular monitoring"
            
            predictions.append({
                "machine_id": row['machine_id'],
                "failure_probability": round(prob, 4),
                "risk_level": risk,
                "recommendation": rec,
                "temperature": round(row['temperature'], 2),
                "vibration": round(row['vibration'], 3),
                "pressure": round(row['pressure'], 2),
                "runtime_hours": round(row['runtime_hours'], 2)
            })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total_machines": len(predictions),
            "high_risk": sum(1 for p in predictions if p['risk_level'] == 'High'),
            "medium_risk": sum(1 for p in predictions if p['risk_level'] == 'Medium'),
            "low_risk": sum(1 for p in predictions if p['risk_level'] == 'Low'),
            "predictions": predictions
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict_yield")
async def predict_yield():
    """Predict yield for all machines."""
    try:
        if not models:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        # Load data
        df = pd.read_csv(DATA_PATH)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = feature_engineering(df)
        
        # Get latest reading per machine
        latest = df.groupby('machine_id').tail(1).reset_index(drop=True)
        
        # Prepare features
        X = latest[models['yield_features']]
        X_scaled = models['yield_scaler'].transform(X)
        
        # Predict
        yields = models['yield_model'].predict(X_scaled)
        
        # Build response
        predictions = []
        for idx, row in latest.iterrows():
            yield_val = float(yields[idx])
            efficiency = np.clip(yield_val, 0, 100)
            
            if efficiency >= 85:
                level = "Excellent"
            elif efficiency >= 70:
                level = "Good"
            else:
                level = "Poor"
            
            predictions.append({
                "machine_id": row['machine_id'],
                "predicted_yield": round(yield_val, 2),
                "efficiency_percentage": round(efficiency, 2),
                "performance_level": level,
                "temperature": round(row['temperature'], 2),
                "pressure": round(row['pressure'], 2),
                "speed": round(row['speed'], 2)
            })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total_machines": len(predictions),
            "average_efficiency": round(np.mean([p['efficiency_percentage'] for p in predictions]), 2),
            "predictions": predictions
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/detect_anomaly")
async def detect_anomaly():
    """Detect anomalies across all machines."""
    try:
        if not models:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        # Load data
        df = pd.read_csv(DATA_PATH)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = feature_engineering(df)
        
        # Get latest reading per machine
        latest = df.groupby('machine_id').tail(1).reset_index(drop=True)
        
        # Prepare features
        X = latest[models['anomaly_features']]
        X_scaled = models['anomaly_scaler'].transform(X)
        
        # Predict clusters
        clusters = models['anomaly_model'].predict(X_scaled)
        
        # Cluster names
        cluster_names = {
            0: 'Normal Operation',
            1: 'Elevated Vibration',
            2: 'High Temperature',
            3: 'Critical Conditions'
        }
        
        # Build response
        results = []
        for idx, row in latest.iterrows():
            cluster = int(clusters[idx])
            is_anomalous = cluster >= 2  # Clusters 2 and 3 are anomalous
            
            results.append({
                "machine_id": row['machine_id'],
                "cluster": cluster,
                "cluster_name": cluster_names.get(cluster, f'Cluster {cluster}'),
                "is_anomalous": is_anomalous,
                "temperature": round(row['temperature'], 2),
                "vibration": round(row['vibration'], 3),
                "pressure": round(row['pressure'], 2),
                "speed": round(row['speed'], 2)
            })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total_machines": len(results),
            "anomalous_machines": sum(1 for r in results if r['is_anomalous']),
            "cluster_distribution": {
                name: sum(1 for r in results if r['cluster'] == cluster)
                for cluster, name in cluster_names.items()
            },
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/machine_health")
async def get_machine_health():
    """Get comprehensive health status for all machines."""
    try:
        if not models:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        # Load data
        df = pd.read_csv(DATA_PATH)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = feature_engineering(df)
        
        # Get latest reading per machine
        latest = df.groupby('machine_id').tail(1).reset_index(drop=True)
        
        # Get predictions from all models
        X_failure = latest[models['failure_features']]
        X_failure_scaled = models['failure_scaler'].transform(X_failure)
        failure_probs = models['failure_model'].predict_proba(X_failure_scaled)[:, 1]
        
        X_yield = latest[models['yield_features']]
        X_yield_scaled = models['yield_scaler'].transform(X_yield)
        yields = models['yield_model'].predict(X_yield_scaled)
        
        X_anomaly = latest[models['anomaly_features']]
        X_anomaly_scaled = models['anomaly_scaler'].transform(X_anomaly)
        clusters = models['anomaly_model'].predict(X_anomaly_scaled)
        
        # Build comprehensive health report
        health_data = []
        for idx, row in latest.iterrows():
            failure_prob = float(failure_probs[idx])
            yield_val = float(yields[idx])
            cluster = int(clusters[idx])
            
            # Calculate health score
            health_score = (
                (1 - failure_prob) * 50 +  # 50% weight
                (np.clip(yield_val, 0, 100) / 100) * 50  # 50% weight
            ) * 100
            
            if health_score >= 75:
                status = "Good"
            elif health_score >= 50:
                status = "Fair"
            else:
                status = "Critical"
            
            health_data.append({
                "machine_id": row['machine_id'],
                "health_score": round(health_score, 2),
                "health_status": status,
                "failure_probability": round(failure_prob, 4),
                "yield_efficiency": round(np.clip(yield_val, 0, 100), 2),
                "cluster": cluster,
                "is_anomalous": cluster >= 2,
                "temperature": round(row['temperature'], 2),
                "vibration": round(row['vibration'], 3),
                "pressure": round(row['pressure'], 2),
                "speed": round(row['speed'], 2),
                "runtime_hours": round(row['runtime_hours'], 2),
                "last_update": row['timestamp'].isoformat()
            })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total_machines": len(health_data),
            "average_health_score": round(np.mean([h['health_score'] for h in health_data]), 2),
            "good_health": sum(1 for h in health_data if h['health_status'] == 'Good'),
            "fair_health": sum(1 for h in health_data if h['health_status'] == 'Fair'),
            "critical_health": sum(1 for h in health_data if h['health_status'] == 'Critical'),
            "machines": health_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refresh_data")
async def refresh_data():
    """Regenerate sensor data and retrain models."""
    try:
        # Run simulation script
        subprocess.run(["python", "../simulate_sensor_data.py"], check=True)
        
        # Retrain models
        subprocess.run(["python", "ml/train_models.py"], check=True)
        
        # Reload models
        load_models()
        
        # Generate reports
        subprocess.run(["python", "../generate_reports.py"], check=True)
        
        return {
            "status": "success",
            "message": "Data refreshed, models retrained, and reports generated",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics")
async def get_statistics():
    """Get overall factory statistics."""
    try:
        df = pd.read_csv(DATA_PATH)
        
        total_samples = len(df)
        total_machines = df['machine_id'].nunique()
        total_failures = df['is_failure'].sum()
        failure_rate = (total_failures / total_samples) * 100
        
        date_range = pd.to_datetime(df['timestamp'])
        
        return {
            "total_samples": int(total_samples),
            "total_machines": int(total_machines),
            "total_failures": int(total_failures),
            "failure_rate_percentage": round(failure_rate, 2),
            "date_range": {
                "start": date_range.min().isoformat(),
                "end": date_range.max().isoformat()
            },
            "average_metrics": {
                "temperature": round(df['temperature'].mean(), 2),
                "vibration": round(df['vibration'].mean(), 3),
                "pressure": round(df['pressure'].mean(), 2),
                "speed": round(df['speed'].mean(), 2),
                "runtime_hours": round(df['runtime_hours'].mean(), 2)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
