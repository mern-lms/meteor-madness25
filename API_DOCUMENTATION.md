# API Documentation

Complete API reference for the Asteroid Impact Simulator.

## Base URLs

- **Node.js API:** `http://localhost:3000`
- **Flask API:** `http://localhost:5000`

## Node.js Endpoints

### NASA NEO Integration

#### GET /api/neo/feed

Get NEO feed for a date range.

**Query Parameters:**
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Example:**
```bash
curl "http://localhost:3000/api/neo/feed?start_date=2025-01-01&end_date=2025-01-07"
```

**Response:**
```json
{
  "element_count": 25,
  "near_earth_objects": {
    "2025-01-01": [
      {
        "id": "2021277",
        "name": "21277 (1996 TO5)",
        "estimated_diameter": {
          "meters": {
            "estimated_diameter_min": 1109.8,
            "estimated_diameter_max": 2481.6
          }
        },
        "is_potentially_hazardous_asteroid": false,
        "close_approach_data": [...]
      }
    ]
  }
}
```

#### GET /api/neo/:id

Get specific asteroid details.

**Parameters:**
- `id`: NASA NEO ID

**Example:**
```bash
curl "http://localhost:3000/api/neo/2021277"
```

**Response:**
```json
{
  "id": "2021277",
  "name": "21277 (1996 TO5)",
  "designation": "21277",
  "nasa_jpl_url": "...",
  "absolute_magnitude_h": 16.1,
  "estimated_diameter": {...},
  "is_potentially_hazardous_asteroid": false,
  "close_approach_data": [...],
  "orbital_data": {...}
}
```

#### GET /api/neo/browse

Browse NEO database.

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Results per page (default: 20)

**Example:**
```bash
curl "http://localhost:3000/api/neo/browse?page=0&size=10"
```

#### GET /api/neo/stats

Get NEO statistics.

**Example:**
```bash
curl "http://localhost:3000/api/neo/stats"
```

**Response:**
```json
{
  "near_earth_objects": {
    "count": 32000
  }
}
```

#### GET /api/asteroids/featured

Get potentially hazardous asteroids in the next 7 days.

**Example:**
```bash
curl "http://localhost:3000/api/asteroids/featured"
```

**Response:**
```json
{
  "count": 5,
  "asteroids": [
    {
      "id": "2021277",
      "name": "21277 (1996 TO5)",
      "diameter_min": 1109.8,
      "diameter_max": 2481.6,
      "velocity": 15.23,
      "miss_distance": 45000000,
      "close_approach_date": "2025-01-05",
      "is_hazardous": true
    }
  ]
}
```

#### GET /api/asteroids/samples

Get sample asteroid scenarios.

**Example:**
```bash
curl "http://localhost:3000/api/asteroids/samples"
```

**Response:**
```json
{
  "samples": [
    {
      "id": "sample_1",
      "name": "Impactor-2025 (Hypothetical)",
      "diameter": 300,
      "velocity": 20,
      "density": 3000,
      "approach_angle": 45,
      "description": "A hypothetical 300m asteroid..."
    }
  ]
}
```

#### GET /api/health

Health check endpoint.

**Example:**
```bash
curl "http://localhost:3000/api/health"
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-01T13:41:13.000Z",
  "nasa_api_key": "configured"
}
```

## Flask Endpoints

### Impact Calculations

#### POST /api/calculate/impact

Calculate impact effects.

**Request Body:**
```json
{
  "diameter": 100,
  "velocity": 20,
  "density": 3000,
  "angle": 45
}
```

**Parameters:**
- `diameter`: Asteroid diameter in meters (10-10000)
- `velocity`: Impact velocity in km/s (11-72)
- `density`: Asteroid density in kg/m³ (1000-8000)
- `angle`: Impact angle in degrees (0-90)

**Example:**
```bash
curl -X POST http://localhost:5000/api/calculate/impact \
  -H "Content-Type: application/json" \
  -d '{"diameter": 100, "velocity": 20, "density": 3000, "angle": 45}'
```

**Response:**
```json
{
  "asteroid": {
    "diameter": 100,
    "mass": 1570796326.7948966,
    "velocity": 20,
    "density": 3000,
    "angle": 45
  },
  "energy": {
    "joules": 314159265358979.3,
    "megatons_tnt": 75.09,
    "hiroshima_bombs": 5006.0
  },
  "crater": {
    "diameter_meters": 1842.5,
    "diameter_km": 1.84,
    "depth_meters": 614.2
  },
  "seismic": {
    "magnitude": 6.2,
    "description": "Moderate - Significant damage in populated areas"
  },
  "effects": {
    "fireball_radius_km": 1.18,
    "thermal_radius_km": 4.32,
    "blast_radius_severe_km": 0.97,
    "blast_radius_moderate_km": 2.28,
    "tsunami_potential": "High"
  },
  "classification": {
    "level": "Regional",
    "description": "Regional devastation, city-killer",
    "color": "#fb923c"
  }
}
```

#### POST /api/calculate/trajectory

Calculate orbital trajectory.

**Request Body:**
```json
{
  "semi_major_axis": 224400000000,
  "eccentricity": 0.1,
  "inclination": 5,
  "long_ascending_node": 0,
  "arg_periapsis": 0,
  "num_points": 100
}
```

**Parameters:**
- `semi_major_axis`: Semi-major axis in meters (default: 1.5 AU)
- `eccentricity`: Orbital eccentricity (0-1)
- `inclination`: Orbital inclination in degrees
- `long_ascending_node`: Longitude of ascending node in degrees
- `arg_periapsis`: Argument of periapsis in degrees
- `num_points`: Number of trajectory points (default: 100)

**Example:**
```bash
curl -X POST http://localhost:5000/api/calculate/trajectory \
  -H "Content-Type: application/json" \
  -d '{"semi_major_axis": 224400000000, "eccentricity": 0.1}'
```

**Response:**
```json
{
  "trajectory": [
    {
      "x": 1.5,
      "y": 0.0,
      "z": 0.0,
      "true_anomaly": 0
    },
    {
      "x": 1.49,
      "y": 0.13,
      "z": 0.0,
      "true_anomaly": 3.6
    }
  ],
  "orbital_period_days": 670.5
}
```

#### POST /api/calculate/mitigation

Calculate deflection strategy effects.

**Request Body:**
```json
{
  "diameter": 100,
  "velocity": 20,
  "density": 3000,
  "strategy": "kinetic_impactor",
  "warning_time": 10,
  "deflection_time": 5
}
```

**Parameters:**
- `diameter`: Asteroid diameter in meters
- `velocity`: Asteroid velocity in km/s
- `density`: Asteroid density in kg/m³
- `strategy`: Deflection strategy
  - `kinetic_impactor`
  - `gravity_tractor`
  - `laser_ablation`
  - `nuclear`
- `warning_time`: Warning time in years
- `deflection_time`: Time before impact to deflect (years)
- `impactor_mass` (optional): For kinetic impactor (kg)
- `impactor_velocity` (optional): For kinetic impactor (km/s)
- `spacecraft_mass` (optional): For gravity tractor (kg)
- `laser_power` (optional): For laser ablation (W)
- `nuclear_yield` (optional): For nuclear (MT)

**Example:**
```bash
curl -X POST http://localhost:5000/api/calculate/mitigation \
  -H "Content-Type: application/json" \
  -d '{
    "diameter": 100,
    "velocity": 20,
    "density": 3000,
    "strategy": "kinetic_impactor",
    "warning_time": 10,
    "deflection_time": 5
  }'
```

**Response:**
```json
{
  "strategy": "kinetic_impactor",
  "parameters": {
    "warning_time_years": 10,
    "deflection_time_years": 5,
    "asteroid_mass_kg": 1570796326.79
  },
  "results": {
    "delta_v_ms": 0.0191,
    "delta_v_cms": 1.91,
    "deflection_distance_km": 3014.4,
    "deflection_angle_degrees": 0.0000955,
    "success": false,
    "success_margin_km": -3356.6
  },
  "recommendation": {
    "status": "Insufficient",
    "message": "Deflection insufficient - need more powerful intervention or earlier action",
    "color": "#ef4444"
  }
}
```

#### POST /api/calculate/crater

Detailed crater calculations.

**Request Body:**
```json
{
  "diameter": 100,
  "velocity": 20,
  "density": 3000,
  "angle": 45,
  "target_type": "rock"
}
```

**Parameters:**
- `diameter`: Asteroid diameter in meters
- `velocity`: Impact velocity in km/s
- `density`: Asteroid density in kg/m³
- `angle`: Impact angle in degrees
- `target_type`: Target material
  - `rock` (default)
  - `sand`
  - `ice`
  - `water`

**Example:**
```bash
curl -X POST http://localhost:5000/api/calculate/crater \
  -H "Content-Type: application/json" \
  -d '{"diameter": 100, "velocity": 20, "density": 3000, "angle": 45, "target_type": "rock"}'
```

**Response:**
```json
{
  "crater": {
    "diameter_m": 1842.5,
    "diameter_km": 1.84,
    "depth_m": 614.2,
    "volume_m3": 1635000000,
    "ejecta_radius_m": 4606.3
  },
  "comparison": "About 1.8 km - similar to Meteor Crater, Arizona"
}
```

#### GET /api/health

Health check endpoint.

**Example:**
```bash
curl "http://localhost:5000/api/health"
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-01T13:41:13.000000",
  "service": "Asteroid Impact Calculator"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

**NASA API:**
- DEMO_KEY: 30 requests per hour, 50 per day
- Personal key: 1000 requests per hour

**Flask API:**
- No rate limiting (local server)

## CORS

Both APIs support CORS for cross-origin requests.

## Authentication

No authentication required for local development.

For production deployment, consider adding:
- API keys
- Rate limiting
- Authentication tokens

## Webhooks

Not currently supported. Feature planned for future release.

## SDK/Client Libraries

JavaScript client example:

```javascript
// Impact calculation
async function calculateImpact(params) {
  const response = await fetch('http://localhost:5000/api/calculate/impact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return await response.json();
}

// Usage
const result = await calculateImpact({
  diameter: 100,
  velocity: 20,
  density: 3000,
  angle: 45
});
console.log(result);
```

Python client example:

```python
import requests

def calculate_impact(params):
    response = requests.post(
        'http://localhost:5000/api/calculate/impact',
        json=params
    )
    return response.json()

# Usage
result = calculate_impact({
    'diameter': 100,
    'velocity': 20,
    'density': 3000,
    'angle': 45
})
print(result)
```

## Testing

Use the included test files or tools like:
- Postman
- Insomnia
- curl
- HTTPie

---

**For more information, see the source code or open an issue.**
