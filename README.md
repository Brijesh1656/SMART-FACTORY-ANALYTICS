# 🏭 Smart Factory Analytics

> **AI-Driven Predictive Maintenance & Industrial Simulation Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

A full-stack simulation-driven industrial analytics platform combining ML-based predictive maintenance, anomaly detection, and yield analysis with a real-time dashboard.  
Built using **synthetic sensor data**, **FastAPI**, **scikit-learn**, and **Next.js** to demonstrate modern Industry 4.0 architectures and end-to-end AI systems.

---

## 🎯 Project Overview

Smart Factory Analytics demonstrates how factories can use AI to:

- Predict potential equipment failures  
- Detect anomalous sensor patterns  
- Estimate yield efficiency  
- Visualize multi-machine health  
- Export analytics for Power BI  

The system uses a **synthetic sensor data generator** (103,680 samples) that simulates realistic industrial behavior.

---

## ✅ Key Features

- Real-time dashboard (Next.js + TypeScript)  
- Predictive maintenance (Random Forest)  
- Anomaly detection (K-Means clustering)  
- Yield estimation (regression model)  
- Synthetic multi-machine data simulation  
- FastAPI ML inference backend  
- CSV export for Power BI  
- Docker-ready structure  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SMART FACTORY ANALYTICS                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐     ┌─────────────┐  │
│  │   Next.js    │◄────►│   FastAPI    │◄───►│   ML Models │  │
│  │  Dashboard   │      │   Backend    │     │   (.pkl)    │  │
│  └──────────────┘      └──────────────┘     └─────────────┘  │
│         │                      │                     │         │
│         ▼                      ▼                     ▼         │
│  ┌──────────────┐      ┌──────────────┐     ┌──────────────┐ │
│  │ Sensor Data  │      │  Prediction  │     │ Anomaly/      │ │
│  │ Simulation   │      │   Engine     │     │ Yield Models  │ │
│  └──────────────┘      └──────────────┘     └──────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
smart-factory-analytics/
│
├── backend/
│   ├── main.py
│   ├── ml/
│   │   ├── train_models.py
│   │   ├── failure_model.pkl
│   │   ├── anomaly_model.pkl
│   │   └── yield_model.pkl
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── styles/
│
├── data/
│   └── factory_sensors.csv
│
├── simulate_sensor_data.py
├── generate_reports.py
├── requirements.txt
└── docker-compose.yml
```

---

## 🤖 Machine Learning Models

### 1. Failure Prediction  
- Random Forest Classifier  
- Accuracy: **~97.91% (synthetic data)**  
- Output: failure probability  

### 2. Yield Estimation  
- Random Forest Regressor  
- Output: predicted yield percentage  

### 3. Anomaly Detection  
- K-Means (4 clusters)  
- Output: cluster label per machine pattern  

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Brijesh1656/smart-factory-analytics.git
cd smart-factory-analytics
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
python simulate_sensor_data.py
python backend/ml/train_models.py
```

### 3. Start the backend

```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📈 Power BI Integration

This project exports CSV files for:

- failure predictions
- yield performance
- anomaly clusters
- machine health summary

Import them into Power BI → "Get Data" → "Text/CSV".

---

## 📡 API Documentation

API available at:
**[http://localhost:8000/docs](http://localhost:8000/docs)**

| Endpoint           | Method | Description           |
| ------------------ | ------ | --------------------- |
| `/predict_failure` | GET    | Failure probability   |
| `/predict_yield`   | GET    | Yield estimation      |
| `/detect_anomaly`  | GET    | Anomaly detection     |
| `/machine_health`  | GET    | Combined model output |

---

## 🎨 Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python
- **ML:** scikit-learn, Pandas, NumPy
- **Deployment:** Docker, Railway, Render
- **Charts:** Recharts

---

## ✅ Status

This project is simulation-based and intended for:

- portfolio demonstration
- ML workflow learning
- real-time dashboard engineering
- industrial systems experimentation

*Not a production factory system.*

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Brijesh Singh**

- GitHub: [https://github.com/Brijesh1656](https://github.com/Brijesh1656)
- LinkedIn: [https://linkedin.com/in/brijesh-singh-b84275307](https://linkedin.com/in/brijesh-singh-b84275307)
- Portfolio: [https://brijeshsingh-ai.netlify.app](https://brijeshsingh-ai.netlify.app)
- Email: [brijesh7146@gmail.com](mailto:brijesh7146@gmail.com)

---
