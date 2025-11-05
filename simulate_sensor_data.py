"""
Smart Factory Analytics - Synthetic Sensor Data Simulator
Generates realistic industrial IoT sensor data for testing and demonstration.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Configuration
NUM_MACHINES = 12
DAYS_OF_DATA = 30
SAMPLES_PER_DAY = 288  # Every 5 minutes
FAILURE_RATE = 0.05  # 5% failure probability
OUTPUT_PATH = "data/factory_sensors.csv"

np.random.seed(42)

def generate_sensor_data():
    """Generate synthetic sensor data for smart factory simulation."""
    
    print(f"🏭 Generating synthetic sensor data for {NUM_MACHINES} machines...")
    print(f"📊 Time range: {DAYS_OF_DATA} days with {SAMPLES_PER_DAY} samples/day")
    
    data = []
    start_time = datetime.now() - timedelta(days=DAYS_OF_DATA)
    
    for machine_id in range(1, NUM_MACHINES + 1):
        # Each machine has baseline characteristics
        base_temp = np.random.uniform(65, 75)
        base_vibration = np.random.uniform(0.5, 1.5)
        base_pressure = np.random.uniform(90, 110)
        base_speed = np.random.uniform(1200, 1800)
        runtime_hours = np.random.uniform(5000, 15000)
        
        # Simulate degradation over time
        degradation_rate = np.random.uniform(0.001, 0.003)
        
        for day in range(DAYS_OF_DATA):
            for sample in range(SAMPLES_PER_DAY):
                timestamp = start_time + timedelta(days=day, minutes=sample * 5)
                
                # Progressive degradation
                degradation_factor = 1 + (day * degradation_rate)
                
                # Add realistic noise and patterns
                hour_of_day = timestamp.hour
                day_cycle = np.sin(2 * np.pi * hour_of_day / 24)  # Daily cycle
                
                # Temperature (increases with degradation and time of day)
                temperature = base_temp * degradation_factor + np.random.normal(0, 2) + day_cycle * 3
                
                # Vibration (increases with degradation)
                vibration = base_vibration * degradation_factor + np.random.normal(0, 0.1)
                
                # Pressure (slight variations)
                pressure = base_pressure + np.random.normal(0, 5) - day_cycle * 2
                
                # Speed (operational variations)
                speed = base_speed + np.random.normal(0, 50)
                
                # Runtime hours increment
                runtime_hours += 5 / 60  # 5 minutes
                
                # Failure logic: higher probability with degradation and anomalies
                failure_risk = degradation_factor * 0.02
                if temperature > 85 or vibration > 2.5 or pressure < 80:
                    failure_risk *= 3
                
                is_failure = 1 if np.random.random() < failure_risk else 0
                
                # If failure occurs, reset the machine (maintenance)
                if is_failure:
                    degradation_rate = np.random.uniform(0.001, 0.003)
                    base_temp = np.random.uniform(65, 75)
                    base_vibration = np.random.uniform(0.5, 1.5)
                
                data.append({
                    'machine_id': f'M{machine_id:03d}',
                    'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    'temperature': round(temperature, 2),
                    'vibration': round(vibration, 3),
                    'pressure': round(pressure, 2),
                    'speed': round(speed, 2),
                    'runtime_hours': round(runtime_hours, 2),
                    'is_failure': is_failure
                })
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    # Save to CSV
    df.to_csv(OUTPUT_PATH, index=False)
    
    # Statistics
    total_samples = len(df)
    total_failures = df['is_failure'].sum()
    failure_percentage = (total_failures / total_samples) * 100
    
    print(f"\n✅ Data generation complete!")
    print(f"📁 Output: {OUTPUT_PATH}")
    print(f"📊 Total samples: {total_samples:,}")
    print(f"⚠️  Total failures: {total_failures} ({failure_percentage:.2f}%)")
    print(f"🔧 Machines: {NUM_MACHINES}")
    print(f"📅 Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    print(f"💾 File size: {os.path.getsize(OUTPUT_PATH) / 1024 / 1024:.2f} MB\n")
    
    return df

def display_sample_data(df):
    """Display sample statistics and data."""
    print("📈 Sample Statistics:")
    print(df.describe())
    print("\n🔍 Sample Data (first 10 rows):")
    print(df.head(10))
    print("\n⚙️  Failure Distribution by Machine:")
    print(df.groupby('machine_id')['is_failure'].agg(['sum', 'mean']))

if __name__ == "__main__":
    print("=" * 80)
    print("🏭 SMART FACTORY ANALYTICS - DATA SIMULATOR")
    print("=" * 80)
    
    df = generate_sensor_data()
    display_sample_data(df)
    
    print("=" * 80)
    print("🎯 Next steps:")
    print("   1. Run: python backend/ml/train_models.py (to train ML models)")
    print("   2. Run: python generate_reports.py (to generate Power BI reports)")
    print("   3. Run: cd frontend && npm run dev (to start the dashboard)")
    print("=" * 80)
