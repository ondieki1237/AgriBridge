# AgriBridge Backend (minimal scaffold)

This repository contains a minimal Node.js + Express backend with a reusable Nodemailer mailer and a Python FastAPI stub for spoilage prediction.

Architecture:
- Node.js (Express) API: src/
- MongoDB via Mongoose
- Mailer service: src/services/mailer.js (Nodemailer)
- Python FastAPI service: python_service/app.py

Quick start

1. Node backend

 - Copy `.env.example` to `.env` and fill values.
 - Install and run:

```bash
cd /home/seth/Documents/code/AgriBridge
npm install
npm run dev
```

2. Python service

 - Create a virtualenv, install requirements and run uvicorn:

```bash
cd python_service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

What I implemented
- Basic Express server with produce create/list endpoints.
- Mongoose model for produce.
- Reusable Nodemailer service module used by the produce controller.
- Python FastAPI microservice stub that returns a spoilage risk score.
- Environment example and README.

Next steps (suggested)
- Add authentication (JWT) and farmer/buyer models.
- Integrate Africa's Talking / Twilio for SMS/USSD flows.
- Expand Python service with real climate APIs and ML models (pandas/scikit-learn).
- Add transactional logging and dashboards.
# AgriBridge
AgriBridge reduces post-harvest losses and increases farmer incomes by ensuring timely, aggregated deliveries to reliable buyers, guided by climate-aware alerts
