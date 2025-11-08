# 🚀 Quick Start Guide

**Get the Smart Factory Analytics platform running in 5 minutes**

---

## 📋 Prerequisites

- **Python 3.9+** (`python3 --version`)
- **Node.js 18+** and npm (`node --version`)
- **8GB RAM minimum** (for ML model training)

---

## ⚡ Installation

### 1. Clone Repository

```bash
git clone https://github.com/Brijesh1656/SMART-FACTORY-ANALYTICS.git
cd SMART-FACTORY-ANALYTICS
```

### 2. Set Up Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Generate Data & Train Models

```bash
# Generate synthetic sensor data (12 machines, 103K samples)
python simulate_sensor_data.py

# Train ML models (~2 minutes)
python backend/ml/train_models.py

# Generate Power BI reports
python generate_reports.py
```

**Expected output:**
```
✅ Accuracy: 97.91%
✅ Model Performance: MAE: 2.17%
✅ Silhouette Score: 0.0898
🎉 ALL MODELS TRAINED SUCCESSFULLY!
```

### 5. Start Backend Server

Open a terminal:

```bash
cd backend
source ../venv/bin/activate  # On Windows: ..\venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Keep this running!**

### 6. Install Frontend Dependencies

Open a **new terminal**:

```bash
cd frontend
npm install
```

### 7. Start Frontend Server

```bash
npm run dev
```

**Keep this running!**

### 8. Access the Dashboard

Open your browser:

🌐 **http://localhost:3000**

---

## 🎯 What You'll See

**4 Interactive Tabs:**

1. **📊 Overview** - Real-time health metrics and KPIs
2. **🔧 Maintenance** - Predictive failure analysis
3. **🔍 Anomaly Detection** - Cluster analysis and alerts
4. **📈 Yield Optimization** - Production efficiency insights

---

## 🧪 Test the API

```bash
# Health check
curl http://localhost:8000/health

# Predict failure
curl http://localhost:8000/predict_failure

# Machine health
curl http://localhost:8000/machine_health

# API documentation
open http://localhost:8000/docs
```

---

## 📊 Power BI Integration

Import CSV reports from `reports/` folder:

- `failure_predictions.csv`
- `yield_performance.csv`
- `anomaly_clusters.csv`
- `machine_health_overview.csv`

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8000
lsof -i :8000 | awk 'NR>1 {print $2}' | xargs kill -9

# Kill process on port 3000
lsof -i :3000 | awk 'NR>1 {print $2}' | xargs kill -9
```

### Models Not Loading

```bash
cd backend
python ml/train_models.py
```

### Frontend Build Errors

```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

---

## 🚀 Deploy to Production

### Backend (Railway/Render)

```bash
# Add these environment variables:
CORS_ORIGINS=["https://your-frontend-url.vercel.app"]
```

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

**Add environment variable in Vercel:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

---

## 📁 Project Structure

```
smart-factory-analytics/
├── backend/               # FastAPI server + ML models
├── frontend/              # Next.js dashboard
├── data/                  # Generated sensor data
├── reports/               # Power BI CSV exports
├── simulate_sensor_data.py
├── generate_reports.py
└── requirements.txt
```

---

## 🎓 Tech Stack

- **Backend:** FastAPI, Python, scikit-learn, pandas, numpy
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Recharts
- **ML Models:** Random Forest, K-Means Clustering
- **Database:** CSV-based (easily upgradeable to PostgreSQL)
- **Deployment:** Vercel (frontend) + Railway (backend)

---

## ⏱️ Total Setup Time

- **Initial setup:** ~3 minutes
- **Model training:** ~2 minutes
- **Total:** ~5 minutes

---

## 📊 Model Performance

| Model | Metric | Score |
|-------|--------|-------|
| Failure Prediction | Accuracy | 97.91% |
| Yield Optimization | MAE | 2.17% |
| Anomaly Detection | Silhouette | 0.0898 |

**Dataset:** 103,680 samples from 12 machines

---

## 🎉 Success!

**Backend API:** http://localhost:8000  
**Frontend Dashboard:** http://localhost:3000  
**API Docs:** http://localhost:8000/docs

**Next Steps:**
- Explore the dashboard
- Test API endpoints
- Import reports into Power BI
- Deploy to production

---

## 📞 Support

- **Issues:** https://github.com/Brijesh1656/SMART-FACTORY-ANALYTICS/issues
- **Discussions:** https://github.com/Brijesh1656/SMART-FACTORY-ANALYTICS/discussions

---

**Built for Industry 4.0 | AI-Powered Predictive Maintenance**
