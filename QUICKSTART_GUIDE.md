# 🚀 Smart Factory Analytics - Quick Start Guide

**Complete step-by-step instructions to run the entire platform from scratch**

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Python 3.9+** installed (`python3 --version`)
- **Node.js 18+** and npm installed (`node --version`)
- **Git** installed (optional, for cloning)
- **8GB RAM minimum** (for ML model training)
- **Linux/macOS** (tested on Arch Linux, Ubuntu, Debian, macOS)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Navigate to Project Directory

```bash
cd "/home/brijesh/Documents/SMART FACTORY ANALYTICS"
```

### Step 2: Set Up Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate
```

### Step 3: Install Python Dependencies

```bash
# Upgrade pip first
pip install --upgrade pip

# Install core scientific packages (pre-built wheels)
pip install --only-binary :all: numpy pandas scikit-learn

# Install remaining dependencies
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed fastapi uvicorn pandas numpy scikit-learn...
```

### Step 4: Generate Synthetic Sensor Data

```bash
python simulate_sensor_data.py
```

**Expected output:**
```
🏭 Generating synthetic sensor data for 12 machines...
✅ Data generation complete!
📁 Output: data/factory_sensors.csv
📊 Total samples: 103,680
```

**Time:** ~10 seconds

### Step 5: Train Machine Learning Models

```bash
python backend/ml/train_models.py
```

**Expected output:**
```
🎯 TRAINING FAILURE PREDICTION MODEL
✅ Accuracy: 97.92%

📈 TRAINING YIELD PREDICTION MODEL
✅ Model Performance: MAE: 2.15%

🔍 TRAINING ANOMALY DETECTION MODEL
✅ Silhouette Score: 0.0896

🎉 ALL MODELS TRAINED SUCCESSFULLY!
```

**Time:** ~2 minutes

### Step 6: Generate Power BI Reports

```bash
python generate_reports.py
```

**Expected output:**
```
📊 Generating Failure Predictions Report...
✅ Saved: reports/failure_predictions.csv

📈 Generating Yield Performance Report...
✅ Saved: reports/yield_performance.csv

🎉 ALL REPORTS GENERATED SUCCESSFULLY!
```

**Time:** ~5 seconds

### Step 7: Start Backend Server

```bash
# Open a new terminal or use background process
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✅ Models loaded successfully
INFO:     Application startup complete.
```

**Keep this terminal running!**

### Step 8: Install Frontend Dependencies

Open a **new terminal window**:

```bash
cd "/home/brijesh/Documents/SMART FACTORY ANALYTICS/frontend"
npm install
```

**Expected output:**
```
added 456 packages in 6s
```

**Time:** ~15 seconds

### Step 9: Start Frontend Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000

✓ Ready in 1583ms
```

**Keep this terminal running!**

### Step 10: Access the Dashboard

Open your browser and navigate to:

🌐 **http://localhost:3000**

---

## 🎯 What You'll See

The dashboard has **4 interactive tabs**:

1. **📊 Overview** - Factory-wide KPIs and health metrics
2. **🔧 Maintenance** - Predictive failure analysis
3. **🔍 Anomaly Detection** - Cluster analysis and alerts
4. **📈 Yield Optimization** - Production efficiency insights

---

## 🧪 Testing the API

### Test Backend Health

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "data_samples": 103680
}
```

### Test Failure Prediction

```bash
curl "http://localhost:8000/predict_failure?machine_id=M001"
```

**Response:**
```json
{
  "machine_id": "M001",
  "failure_probability": 0.023,
  "risk_level": "low",
  "recommendation": "Normal operation - routine maintenance"
}
```

### Test All Endpoints

```bash
# Machine health
curl "http://localhost:8000/machine_health?machine_id=M001"

# Yield prediction
curl "http://localhost:8000/predict_yield?machine_id=M001"

# Anomaly detection
curl "http://localhost:8000/detect_anomaly?machine_id=M001"

# Statistics
curl http://localhost:8000/statistics
```

---

## 📊 Power BI Integration

### Import CSV Reports into Power BI

1. Open **Power BI Desktop**
2. Click **Get Data** → **Text/CSV**
3. Navigate to `reports/` directory
4. Import these files:
   - `failure_predictions.csv`
   - `yield_performance.csv`
   - `anomaly_clusters.csv`
   - `machine_health_overview.csv`

### Create Visualizations

- **Gauge Chart** for health scores
- **Bar Chart** for failure probabilities
- **Scatter Plot** for anomaly clusters
- **Line Chart** for yield trends

---

## 🔄 Regenerate Data & Retrain Models

If you want fresh data:

```bash
# 1. Generate new sensor data
python simulate_sensor_data.py

# 2. Retrain models with new data
python backend/ml/train_models.py

# 3. Regenerate reports
python generate_reports.py

# 4. Restart backend (Ctrl+C in backend terminal, then)
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Kill process on port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Virtual Environment Issues (Arch Linux)

**Error:** `externally-managed-environment`

**Solution:** Always use virtual environment (already covered in Step 2)

### Missing Dependencies

```bash
# Reinstall Python packages
source venv/bin/activate
pip install -r requirements.txt

# Reinstall Node packages
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Models Not Loading

**Error:** `FileNotFoundError: [Errno 2] No such file or directory: 'ml/failure_model.pkl'`

**Solution:**
```bash
# Make sure you're in the correct directory
cd backend
python ml/train_models.py
```

### Frontend Build Errors

```bash
cd frontend
rm -rf .next
npm run dev
```

---

## 🚀 Production Deployment

### Deploy Backend (Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

### Environment Variables

Create `.env.local` in frontend:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

Update `backend/.env`:

```env
CORS_ORIGINS=["https://your-frontend-url.vercel.app"]
```

---

## 📁 Project Structure

```
SMART FACTORY ANALYTICS/
├── data/
│   └── factory_sensors.csv          # Generated sensor data
├── backend/
│   ├── main.py                      # FastAPI server
│   └── ml/
│       ├── train_models.py          # ML training pipeline
│       ├── failure_model.pkl        # Trained models
│       ├── yield_model.pkl
│       └── anomaly_model.pkl
├── frontend/
│   ├── pages/
│   │   └── index.tsx                # Main dashboard
│   └── components/
│       ├── Overview.tsx             # Overview tab
│       ├── Maintenance.tsx          # Maintenance tab
│       ├── Anomaly.tsx              # Anomaly tab
│       └── Yield.tsx                # Yield tab
├── reports/
│   ├── failure_predictions.csv     # Power BI reports
│   ├── yield_performance.csv
│   ├── anomaly_clusters.csv
│   └── machine_health_overview.csv
├── simulate_sensor_data.py          # Data generator
├── generate_reports.py              # Report generator
├── requirements.txt                 # Python dependencies
└── venv/                            # Virtual environment
```

---

## ⏱️ Total Setup Time

- **Initial setup:** ~3 minutes
- **Data generation:** ~10 seconds
- **Model training:** ~2 minutes
- **Frontend installation:** ~15 seconds
- **Total:** ~5-6 minutes

---

## 🎓 What This Project Demonstrates

✅ **Industry 4.0** - Smart manufacturing with IoT
✅ **Machine Learning** - Predictive maintenance, yield optimization
✅ **Full-Stack** - FastAPI + Next.js + TypeScript
✅ **Data Engineering** - Synthetic data generation, feature engineering
✅ **Business Intelligence** - Power BI integration
✅ **DevOps** - Docker, CI/CD, cloud deployment
✅ **Professional UI** - Responsive, animated, production-ready

---

## 📞 Support

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review terminal output for error messages
3. Ensure all prerequisites are installed
4. Verify you're in the correct directory

---

## 🎉 Success!

You now have a **fully operational Smart Factory Analytics platform** running locally!

**Backend API:** http://localhost:8000  
**Frontend Dashboard:** http://localhost:3000  
**API Docs:** http://localhost:8000/docs  

**Next Steps:**
- Explore the dashboard tabs
- Test API endpoints
- Import reports into Power BI
- Customize for your use case
- Deploy to production

---

**Built with ❤️ for Industry 4.0**
