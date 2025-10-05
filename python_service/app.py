from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
import random
import logging
import os
import requests
from fastapi.middleware.cors import CORSMiddleware
import requests_cache
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('spoilage-service')

app = FastAPI(title='AgriBridge Backend Service')

# Allow calls from the Node backend and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('ALLOW_ORIGINS', '*')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- MODELS --------------------

class PredictRequest(BaseModel):
    crop: str
    quantityKg: float
    location: Optional[str] = None

class PredictResponse(BaseModel):
    spoilage_risk: float
    message: str
    details: Optional[dict] = None

class WeatherRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location: Optional[str] = None
    # Expanded default variables for more robust decision making
    hourly: Optional[List[str]] = Field(default_factory=lambda: [
        "temperature_2m", "wind_speed_10m", "soil_temperature_18cm", "soil_moisture_1_to_3cm",
        "soil_moisture_0_to_1cm", "soil_temperature_54cm", "visibility", "cloud_cover_high",
        "showers", "rain", "precipitation", "relative_humidity_2m"
    ])
    daily: Optional[List[str]] = Field(default_factory=lambda: [
        "sunrise", "sunset", "uv_index_max", "temperature_2m_max", "temperature_2m_min",
        "apparent_temperature_max", "apparent_temperature_min", "uv_index_clear_sky_max",
        "sunshine_duration", "daylight_duration", "precipitation_probability_max",
        "precipitation_hours", "precipitation_sum", "snowfall_sum", "showers_sum",
        "rain_sum", "et0_fao_evapotranspiration", "shortwave_radiation_sum",
        "wind_direction_10m_dominant", "wind_gusts_10m_max", "wind_speed_10m_max"
    ])
    # 'current' is not a standard Open-Meteo parameter, but we will synthesize current values
    current: Optional[List[str]] = Field(default_factory=lambda: [
        "temperature_2m", "relative_humidity_2m", "apparent_temperature",
        "is_day", "snowfall", "showers", "rain", "precipitation",
        "surface_pressure", "pressure_msl", "cloud_cover", "weather_code",
        "wind_gusts_10m", "wind_direction_10m", "wind_speed_10m"
    ])
    past_days: int = 0
    timezone: str = 'auto'

# ------------------- ROUTES --------------------

@app.get('/health')
def health():
    return { 'status': 'ok' }

@app.post('/predict', response_model=PredictResponse)
def predict(req: PredictRequest):
    """Spoilage risk predictor based on crop, quantity, and weather (if available)."""
    try:
        logger.info('Predict request: %s', req.dict())

        details = {}
        # Weather (optional if OPENWEATHER_API provided)
        weather = None
        key = os.getenv('OPENWEATHER_API')
        if key and req.location:
            try:
                url = f'https://api.openweathermap.org/data/2.5/weather?q={req.location}&appid={key}&units=metric'
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    weather = r.json()
            except Exception as e:
                logger.warning("Weather fetch failed: %s", e)

        if weather:
            details['weather'] = {
                'temp': weather.get('main', {}).get('temp'),
                'humidity': weather.get('main', {}).get('humidity')
            }

        # Weighted risk model
        base = min(1.0, max(0.0, req.quantityKg / 1000.0))
        humidity_factor = 0.0
        if details.get('weather', {}).get('humidity') is not None:
            humidity = details['weather']['humidity']
            humidity_factor = min(0.5, (humidity - 50) / 100)

        noise = random.random() * 0.2
        score = min(1.0, base + humidity_factor + noise)
        msg = 'Low risk' if score < 0.3 else 'Medium risk' if score < 0.7 else 'High risk'

        return PredictResponse(spoilage_risk=round(score, 3), message=msg, details=details)
    except Exception as e:
        logger.exception('Predict failed')
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/batch_predict', response_model=List[PredictResponse])
def batch_predict(items: List[PredictRequest]):
    return [predict(it) for it in items]

@app.post('/weather')
def weather(req: WeatherRequest):
    """Fetch weather data from Open-Meteo with caching and retries.

    Uses requests-cache for caching and urllib3 Retry via HTTPAdapter for robust retries.
    """
    if not req.latitude or not req.longitude:
        raise HTTPException(status_code=400, detail='latitude and longitude required')

    # Cached session
    sess = requests_cache.CachedSession('.weather_cache', expire_after=3600)

    # Attach retry strategy to the session's adapters
    retry_strategy = Retry(
        total=5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"],
        backoff_factor=0.2,
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    sess.mount('https://', adapter)
    sess.mount('http://', adapter)

    params = {
        'latitude': req.latitude,
        'longitude': req.longitude,
        # Open-Meteo expects comma-separated lists for hourly/daily
        'hourly': ','.join(req.hourly) if req.hourly else None,
        'daily': ','.join(req.daily) if req.daily else None,
        'past_days': req.past_days if req.past_days and req.past_days > 0 else None,
        'timezone': req.timezone,
        'current_weather': True,
    }
    params = {k: v for k, v in params.items() if v is not None}

    url = 'https://api.open-meteo.com/v1/forecast'
    try:
        r = sess.get(url, params=params, timeout=15)
        r.raise_for_status()
        data = r.json()

        result = {'meta': {
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'generationtime_ms': data.get('generationtime_ms'),
            'utc_offset_seconds': data.get('utc_offset_seconds')
        }}

        # Current: prefer provided current_weather, otherwise synthesize from hourly latest timestep
        current = None
        if data.get('current_weather'):
            cw = data['current_weather']
            current = {
                'time': cw.get('time'),
                'temperature_2m': cw.get('temperature'),
                'wind_speed_10m': cw.get('windspeed'),
                'wind_direction_10m': cw.get('winddirection'),
                'weather_code': cw.get('weathercode')
            }
        else:
            # synthesize from hourly if available
            if 'hourly' in data and 'time' in data['hourly']:
                hourly_time = data['hourly'].get('time')
                if hourly_time:
                    latest_idx = len(hourly_time) - 1
                    current = {'time': hourly_time[latest_idx]}
                    for var in req.current or []:
                        # map some common names to hourly keys
                        key = var
                        if var == 'temperature_2m' and 'temperature_2m' in data['hourly']:
                            current[var] = data['hourly']['temperature_2m'][latest_idx]
                        elif var in data['hourly']:
                            current[var] = data['hourly'][var][latest_idx]
                        else:
                            current[var] = None

        result['current'] = current

        # Hourly and daily as dicts of lists, with time converted to ISO via pandas for consistency
        if 'hourly' in data:
            hourly_df = pd.DataFrame(data['hourly'])
            if 'time' in hourly_df.columns:
                hourly_df['time'] = pd.to_datetime(hourly_df['time'])
            result['hourly'] = hourly_df.to_dict(orient='list')
        else:
            result['hourly'] = None

        if 'daily' in data:
            daily_df = pd.DataFrame(data['daily'])
            if 'time' in daily_df.columns:
                daily_df['time'] = pd.to_datetime(daily_df['time'])
            result['daily'] = daily_df.to_dict(orient='list')
        else:
            result['daily'] = None

        result['cached'] = bool(getattr(r, 'from_cache', False))
        return result
    except Exception as e:
        logger.exception('Weather request failed')
        raise HTTPException(status_code=502, detail=str(e))
