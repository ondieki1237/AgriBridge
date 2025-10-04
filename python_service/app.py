from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random

app = FastAPI()

class PredictRequest(BaseModel):
    crop: str
    quantityKg: float
    location: str = None

class PredictResponse(BaseModel):
    spoilage_risk: float
    message: str


@app.post('/predict', response_model=PredictResponse)
def predict(req: PredictRequest):
    # Placeholder logic: random score based on quantity
    try:
        base = min(1.0, max(0.0, req.quantityKg / 1000.0))
        noise = random.random() * 0.3
        score = min(1.0, base + noise)
        msg = 'Low risk' if score < 0.3 else 'Medium risk' if score < 0.7 else 'High risk'
        return { 'spoilage_risk': round(score, 3), 'message': msg }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
