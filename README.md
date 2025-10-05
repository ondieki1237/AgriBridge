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

## Local development

You can run components manually or with Docker Compose. The docker-compose setup brings up MongoDB, the Python service, and the Node backend wired together for local development.

### Using Docker Compose (recommended for local dev)

1. Start services:

```bash
docker compose up --build
```

2. Services exposed:
- Node API: http://localhost:5000
- Python service: http://localhost:8000
- MongoDB: mongodb://localhost:27017

The compose file sets `PYTHON_SERVICE_URL` for the Node container to `http://python:8000` so the Node backend will forward weather requests to the Python service.

### Manual (without Docker)

1. Start MongoDB (e.g., locally or use Atlas). If running locally, default connection is mongodb://localhost:27017.
2. Start Python service:

```bash
cd python_service
source ../.venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

3. Start Node backend from repository root so it loads `.env`:

```bash
node src/index.js
```

4. Test the weather proxy:

```bash
curl -X POST http://localhost:5000/api/python/weather \
	-H "Content-Type: application/json" \
	-d '{"latitude": -2.1026, "longitude": 38.1301, "hourly":["temperature_2m","relative_humidity_2m"], "daily":["uv_index_max"], "past_days":3}'
```

