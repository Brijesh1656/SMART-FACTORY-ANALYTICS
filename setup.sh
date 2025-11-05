#!/bin/bash

echo "🏭 Smart Factory Analytics - Setup Script"
echo "=========================================="

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Generate synthetic data
echo "🔄 Generating synthetic sensor data..."
python simulate_sensor_data.py

# Train ML models
echo "🤖 Training machine learning models..."
python backend/ml/train_models.py

# Generate reports
echo "📊 Generating Power BI reports..."
python generate_reports.py

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start backend:  cd backend && uvicorn main:app --reload"
echo "   2. Start frontend: cd frontend && npm run dev"
echo "   3. Open browser:   http://localhost:3000"
echo ""
