const axios = require('axios');

async function callPythonPredict(baseUrl, payload) {
  try {
    const url = `${baseUrl.replace(/\/$/, '')}/predict`;
    const r = await axios.post(url, payload, { timeout: 7000 });
    return r.data;
  } catch (err) {
    console.warn('Predict call failed:', err.message || err);
    return null;
  }
}

async function callPythonWeather(baseUrl, lat, lon, hourly = ['temperature_2m','relative_humidity_2m'], daily = ['uv_index_max']) {
  try {
    const url = `${baseUrl.replace(/\/$/, '')}/weather`;
    const payload = { latitude: lat, longitude: lon, hourly, daily, past_days: 0, timezone: 'auto' };
    const r = await axios.post(url, payload, { timeout: 10000 });
    return r.data;
  } catch (err) {
    console.warn('Weather call failed:', err.message || err);
    return null;
  }
}

function buildRecommendations(prediction, weather, crop, quantityKg) {
  const recs = [];
  const score = prediction && prediction.spoilage_risk != null ? prediction.spoilage_risk : Math.min(1, quantityKg / 1000);

  if (score >= 0.7) {
    recs.push('High spoilage risk — prioritize immediate sale/collection within 24 hours');
  } else if (score >= 0.4) {
    recs.push('Medium spoilage risk — arrange pickup within 48 hours and consider cool, dry storage');
  } else {
    recs.push('Low spoilage risk — normal handling and scheduling');
  }

  // Weather-driven rules
  try {
    if (weather && weather.current) {
      const cur = weather.current;
      const temp = cur.temperature_2m || cur.temperature || null;
      const hum = cur.relative_humidity_2m || null;
      if (temp != null && hum != null && temp > 28 && hum > 70) {
        recs.push('High temperature & humidity — prioritize cooling and airflow to reduce spoilage');
      } else if (temp != null && temp > 32) {
        recs.push('High temperature — consider rapid cooling or shading');
      }
    }

    if (weather && weather.daily) {
      const daily = weather.daily;
      // daily may be dict of lists; check uv_index_max and precipitation_sum for first day
      const uv = (daily.uv_index_max && daily.uv_index_max[0]) || null;
      const precip = (daily.precipitation_sum && daily.precipitation_sum[0]) || null;
      if (uv != null && uv >= 8) {
        recs.push('High UV expected — use shading to protect produce');
      }
      if (precip != null && precip > 5) {
        recs.push('Rain expected — protect produce and prefer covered transport');
      }
    }
  } catch (e) {
    console.warn('Failed to build weather-driven recommendations', e.message || e);
  }

  return { recommendations: recs, spoilage_score: score };
}

/**
 * Main entry: returns an object with prediction, weather, and recommendations.
 * payload may include latitude/longitude to fetch weather.
 */
exports.recommend = async function ({ crop, quantityKg, location, latitude, longitude }) {
  const base = (process.env.PYTHON_SERVICE_URL && process.env.PYTHON_SERVICE_URL.replace(/\/$/, '')) || null;
  let prediction = null;
  let weather = null;
  if (base) {
    prediction = await callPythonPredict(base, { crop, quantityKg, location });
    if (latitude != null && longitude != null) {
      weather = await callPythonWeather(base, latitude, longitude);
    }
  }

  const built = buildRecommendations(prediction, weather, crop, quantityKg);
  return { prediction, weather, recommendations: built.recommendations, spoilage_score: built.spoilage_score };
};
