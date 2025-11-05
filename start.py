#!/usr/bin/env python3
"""
🏭 SMART FACTORY ANALYTICS - STARTUP GUIDE
============================================

This interactive script helps you get started with the Smart Factory Analytics platform.
"""

import os
import sys
import subprocess
from pathlib import Path

# ANSI color codes for pretty output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_banner():
    """Print the welcome banner."""
    banner = f"""
{Colors.CYAN}{'='*80}
{Colors.BOLD}
    🏭 SMART FACTORY ANALYTICS
    AI-Powered Predictive Maintenance & Yield Optimization
{Colors.END}{Colors.CYAN}
{'='*80}{Colors.END}
    """
    print(banner)

def print_step(step_num, title):
    """Print a step header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}[Step {step_num}]{Colors.END} {Colors.BOLD}{title}{Colors.END}")
    print(f"{Colors.CYAN}{'─'*80}{Colors.END}")

def print_success(message):
    """Print a success message."""
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    """Print an error message."""
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    """Print a warning message."""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message):
    """Print an info message."""
    print(f"{Colors.CYAN}ℹ️  {message}{Colors.END}")

def check_prerequisites():
    """Check if required software is installed."""
    print_step(1, "Checking Prerequisites")
    
    prerequisites = {
        'python': ('python3', '--version'),
        'pip': ('pip3', '--version'),
        'node': ('node', '--version'),
        'npm': ('npm', '--version'),
    }
    
    all_good = True
    for name, (cmd, arg) in prerequisites.items():
        try:
            result = subprocess.run([cmd, arg], capture_output=True, text=True, check=True)
            version = result.stdout.strip() or result.stderr.strip()
            print_success(f"{name.capitalize()}: {version}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print_error(f"{name.capitalize()}: Not found")
            all_good = False
    
    return all_good

def install_python_deps():
    """Install Python dependencies."""
    print_step(2, "Installing Python Dependencies")
    print_info("Installing packages from requirements.txt...")
    
    try:
        subprocess.run(['pip3', 'install', '-r', 'requirements.txt'], check=True)
        print_success("Python dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print_error("Failed to install Python dependencies")
        return False

def generate_data():
    """Generate synthetic sensor data."""
    print_step(3, "Generating Synthetic Sensor Data")
    print_info("Creating realistic factory sensor data...")
    
    try:
        subprocess.run(['python3', 'simulate_sensor_data.py'], check=True)
        print_success("Sensor data generated successfully")
        
        # Check if file was created
        data_file = Path('data/factory_sensors.csv')
        if data_file.exists():
            size_mb = data_file.stat().st_size / (1024 * 1024)
            print_info(f"Data file size: {size_mb:.2f} MB")
        return True
    except subprocess.CalledProcessError:
        print_error("Failed to generate sensor data")
        return False

def train_models():
    """Train machine learning models."""
    print_step(4, "Training Machine Learning Models")
    print_info("Training 3 ML models (this may take a few minutes)...")
    
    try:
        subprocess.run(['python3', 'backend/ml/train_models.py'], check=True)
        print_success("ML models trained successfully")
        
        # Check if models were created
        models = [
            'backend/ml/failure_model.pkl',
            'backend/ml/yield_model.pkl',
            'backend/ml/anomaly_model.pkl'
        ]
        for model in models:
            if Path(model).exists():
                print_info(f"✓ {Path(model).name}")
        return True
    except subprocess.CalledProcessError:
        print_error("Failed to train ML models")
        return False

def generate_reports():
    """Generate Power BI reports."""
    print_step(5, "Generating Power BI Reports")
    print_info("Creating CSV reports for Power BI...")
    
    try:
        subprocess.run(['python3', 'generate_reports.py'], check=True)
        print_success("Power BI reports generated successfully")
        
        # Check if reports were created
        reports = [
            'reports/failure_predictions.csv',
            'reports/yield_performance.csv',
            'reports/anomaly_clusters.csv',
            'reports/machine_health_overview.csv'
        ]
        for report in reports:
            if Path(report).exists():
                print_info(f"✓ {Path(report).name}")
        return True
    except subprocess.CalledProcessError:
        print_error("Failed to generate reports")
        return False

def install_frontend_deps():
    """Install frontend dependencies."""
    print_step(6, "Installing Frontend Dependencies")
    print_info("Installing Node.js packages...")
    
    try:
        original_dir = os.getcwd()
        os.chdir('frontend')
        subprocess.run(['npm', 'install'], check=True)
        os.chdir(original_dir)
        print_success("Frontend dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        os.chdir(original_dir)
        print_error("Failed to install frontend dependencies")
        return False

def print_next_steps():
    """Print instructions for running the application."""
    print(f"\n{Colors.BOLD}{Colors.GREEN}{'='*80}")
    print("🎉 SETUP COMPLETE! YOUR SMART FACTORY ANALYTICS PLATFORM IS READY!")
    print(f"{'='*80}{Colors.END}\n")
    
    print(f"{Colors.BOLD}📋 Next Steps:{Colors.END}\n")
    
    print(f"{Colors.YELLOW}1. Start the Backend API:{Colors.END}")
    print("   Open a terminal and run:")
    print(f"   {Colors.CYAN}cd backend{Colors.END}")
    print(f"   {Colors.CYAN}uvicorn main:app --reload{Colors.END}")
    print("   → Backend will run at http://localhost:8000")
    print("   → API docs at http://localhost:8000/docs\n")
    
    print(f"{Colors.YELLOW}2. Start the Frontend Dashboard:{Colors.END}")
    print("   Open a NEW terminal and run:")
    print(f"   {Colors.CYAN}cd frontend{Colors.END}")
    print(f"   {Colors.CYAN}npm run dev{Colors.END}")
    print("   → Dashboard will run at http://localhost:3000\n")
    
    print(f"{Colors.YELLOW}3. Access the Application:{Colors.END}")
    print("   → Dashboard: http://localhost:3000")
    print("   → API Docs: http://localhost:8000/docs")
    print("   → Power BI Reports: Check the 'reports/' folder\n")
    
    print(f"{Colors.BOLD}📚 Documentation:{Colors.END}")
    print("   → README.md - Main documentation")
    print("   → DEPLOYMENT.md - Deployment guide")
    print("   → PROJECT_SUMMARY.md - Complete project overview\n")
    
    print(f"{Colors.BOLD}🔧 Useful Commands:{Colors.END}")
    print("   → Regenerate data: python simulate_sensor_data.py")
    print("   → Retrain models: python backend/ml/train_models.py")
    print("   → Update reports: python generate_reports.py\n")
    
    print(f"{Colors.GREEN}{'─'*80}{Colors.END}")
    print(f"{Colors.BOLD}Ready to revolutionize smart manufacturing! 🚀{Colors.END}")
    print(f"{Colors.GREEN}{'─'*80}{Colors.END}\n")

def main():
    """Main startup function."""
    print_banner()
    
    print_info("This script will set up your Smart Factory Analytics platform")
    print_info("Estimated time: 3-5 minutes\n")
    
    # Check prerequisites
    if not check_prerequisites():
        print_error("\nPlease install missing prerequisites and try again.")
        print_info("Required: Python 3.9+, pip, Node.js 18+, npm")
        sys.exit(1)
    
    # Run setup steps
    steps = [
        ("Installing Python dependencies", install_python_deps),
        ("Generating synthetic data", generate_data),
        ("Training ML models", train_models),
        ("Generating Power BI reports", generate_reports),
        ("Installing frontend dependencies", install_frontend_deps),
    ]
    
    for step_name, step_func in steps:
        if not step_func():
            print_error(f"\n❌ Setup failed at: {step_name}")
            print_warning("Please fix the error and run the script again")
            sys.exit(1)
    
    # Print next steps
    print_next_steps()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Setup interrupted by user{Colors.END}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.RED}Unexpected error: {e}{Colors.END}")
        sys.exit(1)
