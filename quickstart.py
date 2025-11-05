"""
Quick Start Script for Smart Factory Analytics
Run this to quickly test all components of the system.
"""

import subprocess
import sys
import time
import os

def print_header(text):
    """Print a formatted header."""
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80 + "\n")

def run_command(cmd, description):
    """Run a command and handle errors."""
    print(f"⏳ {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - SUCCESS")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - FAILED")
        print(f"Error: {e.stderr}")
        return False

def main():
    """Main quick start function."""
    print_header("🏭 SMART FACTORY ANALYTICS - QUICK START")
    
    # Check Python version
    if sys.version_info < (3, 9):
        print("❌ Python 3.9+ required. Current version:", sys.version)
        sys.exit(1)
    
    print(f"✅ Python version: {sys.version.split()[0]}")
    
    # Step 1: Install Python dependencies
    print_header("Step 1: Installing Python Dependencies")
    if not run_command("pip install -r requirements.txt", "Installing Python packages"):
        sys.exit(1)
    
    # Step 2: Generate data
    print_header("Step 2: Generating Synthetic Sensor Data")
    if not run_command("python simulate_sensor_data.py", "Generating sensor data"):
        sys.exit(1)
    
    # Step 3: Train models
    print_header("Step 3: Training Machine Learning Models")
    if not run_command("python backend/ml/train_models.py", "Training ML models"):
        sys.exit(1)
    
    # Step 4: Generate reports
    print_header("Step 4: Generating Power BI Reports")
    if not run_command("python generate_reports.py", "Generating CSV reports"):
        sys.exit(1)
    
    # Step 5: Install frontend dependencies
    print_header("Step 5: Installing Frontend Dependencies")
    original_dir = os.getcwd()
    os.chdir("frontend")
    if not run_command("npm install", "Installing Node.js packages"):
        os.chdir(original_dir)
        sys.exit(1)
    os.chdir(original_dir)
    
    # Success!
    print_header("🎉 SETUP COMPLETE!")
    print("✅ All components are ready!")
    print("\n📋 Next Steps:")
    print("\n   1. Start the Backend API:")
    print("      cd backend")
    print("      uvicorn main:app --reload")
    print("\n   2. Start the Frontend (in a new terminal):")
    print("      cd frontend")
    print("      npm run dev")
    print("\n   3. Open your browser:")
    print("      http://localhost:3000")
    print("\n   4. View API documentation:")
    print("      http://localhost:8000/docs")
    print("\n" + "="*80)
    print("Happy analyzing! 🚀")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
