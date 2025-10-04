# System Architecture

## Overview

The Asteroid Impact Simulator uses a three-tier architecture with separate frontend, API gateway, and calculation engine components.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Frontend (HTML/JS)                      │  │
│  │                                                             │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │  │
│  │  │   Three.js   │  │   D3.js      │  │   TailwindCSS   │ │  │
│  │  │   (3D View)  │  │  (Charts)    │  │   (Styling)     │ │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘ │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │           User Interface Components                   │ │  │
│  │  │  • Parameter Sliders                                  │ │  │
│  │  │  • 3D Visualization Canvas                            │ │  │
│  │  │  • Results Dashboard                                  │ │  │
│  │  │  • Mitigation Controls                                │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │
        ┌───────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────────┐                  ┌──────────────────────┐
│   Node.js Server  │                  │   Flask API Server   │
│   (Port 3000)     │                  │   (Port 5000)        │
│                   │                  │                      │
│  ┌─────────────┐ │                  │  ┌────────────────┐ │
│  │   Express   │ │                  │  │     Flask      │ │
│  │   Routes    │ │                  │  │    Routes      │ │
│  └─────────────┘ │                  │  └────────────────┘ │
│                   │                  │                      │
│  ┌─────────────┐ │                  │  ┌────────────────┐ │
│  │   NASA API  │ │                  │  │  NumPy Physics │ │
│  │ Integration │ │                  │  │  Calculations  │ │
│  └─────────────┘ │                  │  └────────────────┘ │
│                   │                  │                      │
│  ┌─────────────┐ │                  │  ┌────────────────┐ │
│  │   Static    │ │                  │  │   Orbital      │ │
│  │   Files     │ │                  │  │   Mechanics    │ │
│  └─────────────┘ │                  │  └────────────────┘ │
└─────────┬─────────┘                  └──────────────────────┘
          │
          │ HTTPS
          │
          ▼
┌─────────────────────┐
│    NASA NEO API     │
│  api.nasa.gov/neo   │
│                     │
│  • NEO Feed         │
│  • NEO Browse       │
│  • NEO Details      │
│  • Statistics       │
└─────────────────────┘
```

## Component Details

### Frontend Layer

**Technology:** HTML5, CSS3, JavaScript (ES6+)

**Responsibilities:**
- User interface rendering
- 3D visualization (Three.js)
- User input handling
- API communication
- Results presentation

**Key Files:**
- `public/index.html` - Main UI structure
- `public/app.js` - Application logic and 3D rendering

**Libraries:**
- Three.js r128 - 3D graphics
- D3.js v7 - Data visualization
- TailwindCSS - Styling
- Lucide - Icons

### API Gateway (Node.js)

**Technology:** Node.js + Express v4.18

**Responsibilities:**
- NASA API integration
- Request routing
- Static file serving
- CORS handling
- Error management

**Key Endpoints:**
```
GET  /api/neo/feed          - NEO feed data
GET  /api/neo/:id           - Specific asteroid
GET  /api/neo/browse        - Browse database
GET  /api/neo/stats         - Statistics
GET  /api/asteroids/featured - Hazardous asteroids
GET  /api/asteroids/samples  - Sample scenarios
GET  /api/health            - Health check
```

**Key Files:**
- `server.js` - Express server and routes

**Dependencies:**
- express - Web framework
- axios - HTTP client
- cors - CORS middleware
- dotenv - Environment variables

### Calculation Engine (Flask)

**Technology:** Python 3.8+ + Flask v3.0

**Responsibilities:**
- Impact physics calculations
- Orbital mechanics
- Mitigation simulations
- Crater scaling
- Scientific computations

**Key Endpoints:**
```
POST /api/calculate/impact      - Impact effects
POST /api/calculate/trajectory  - Orbital path
POST /api/calculate/mitigation  - Deflection strategies
POST /api/calculate/crater      - Crater details
GET  /api/health               - Health check
```

**Key Files:**
- `app.py` - Flask server and calculation logic

**Dependencies:**
- flask - Web framework
- flask-cors - CORS support
- numpy - Numerical computing
- python-dotenv - Environment variables

### External APIs

**NASA NEO API:**
- Base URL: `https://api.nasa.gov/neo/rest/v1`
- Authentication: API key
- Rate Limits: 1000 req/hour (personal key)
- Data: Near-Earth Object information

## Data Flow

### Impact Calculation Flow

```
User Input (Frontend)
    │
    ├─ Diameter (10-10000m)
    ├─ Velocity (11-72 km/s)
    ├─ Density (1000-8000 kg/m³)
    └─ Angle (0-90°)
    │
    ▼
POST /api/calculate/impact (Flask)
    │
    ├─ Calculate Mass
    │   └─ m = ρ × (4/3)πr³
    │
    ├─ Calculate Energy
    │   └─ KE = ½mv²
    │
    ├─ Calculate Crater
    │   └─ Holsapple & Housen scaling
    │
    ├─ Calculate Seismic
    │   └─ M = 0.67×log₁₀(E) - 5.87
    │
    ├─ Calculate Blast Effects
    │   └─ Overpressure zones
    │
    └─ Calculate Thermal Effects
        └─ Fireball and burn radius
    │
    ▼
JSON Response
    │
    ├─ Energy (Joules, MT, Hiroshima)
    ├─ Crater (diameter, depth, volume)
    ├─ Seismic (magnitude, description)
    ├─ Effects (blast, thermal, tsunami)
    └─ Classification (level, description)
    │
    ▼
Display Results (Frontend)
    │
    ├─ Update Statistics Cards
    ├─ Populate Results Tabs
    └─ Update 3D Visualization
```

### NASA Data Flow

```
User Opens App
    │
    ▼
GET /api/asteroids/featured (Node.js)
    │
    ▼
GET /neo/rest/v1/feed (NASA API)
    │
    ├─ Query: start_date, end_date
    └─ API Key: NASA_API_KEY
    │
    ▼
Parse Response
    │
    ├─ Filter: is_potentially_hazardous
    ├─ Extract: diameter, velocity, miss_distance
    └─ Sort: by closest approach
    │
    ▼
JSON Response
    │
    └─ Top 10 hazardous asteroids
    │
    ▼
Display Cards (Frontend)
    │
    └─ Interactive asteroid cards
```

### 3D Visualization Flow

```
Initialize Three.js Scene
    │
    ├─ Create Scene
    ├─ Setup Camera
    ├─ Add Renderer
    └─ Add Lights
    │
    ▼
Create Objects
    │
    ├─ Earth (Blue sphere)
    ├─ Asteroid (Red sphere)
    ├─ Orbit Path (Yellow line)
    ├─ Grid Helper
    └─ Star Field (1000 particles)
    │
    ▼
Animation Loop
    │
    ├─ Rotate Earth
    ├─ Move Asteroid along orbit
    ├─ Rotate Camera
    └─ Render Scene (60 FPS)
    │
    ▼
User Interaction
    │
    ├─ Slider Change → Update asteroid size
    ├─ View Toggle → Show/hide orbit
    └─ Calculate → Update visualization
```

## State Management

### Frontend State

```javascript
const state = {
    // Asteroid parameters
    diameter: 100,        // meters
    velocity: 20,         // km/s
    density: 3000,        // kg/m³
    angle: 45,            // degrees
    
    // Results cache
    impactResults: null,
    mitigationResults: null,
    
    // UI state
    activeTab: 'impact',
    viewMode: 'orbit'
};
```

### Session State

- No server-side sessions
- Stateless API design
- All state in frontend
- No database required

## Security Architecture

### API Security

**Node.js Server:**
- CORS enabled for localhost
- Environment variables for secrets
- Input validation
- Error handling

**Flask Server:**
- CORS enabled
- Input validation
- Type checking
- Error handling

**NASA API:**
- API key in environment
- Rate limiting handled by NASA
- HTTPS only

### Production Security

- HTTPS/TLS encryption
- Secure headers (CSP, X-Frame-Options)
- Input sanitization
- Rate limiting
- API key rotation
- Firewall rules

## Scalability

### Current Architecture

- Single Node.js instance
- Single Flask instance
- Suitable for: 100-1000 concurrent users

### Scaling Strategy

**Horizontal Scaling:**
```
Load Balancer
    │
    ├─ Node.js Instance 1
    ├─ Node.js Instance 2
    └─ Node.js Instance 3
    
    ├─ Flask Instance 1
    ├─ Flask Instance 2
    └─ Flask Instance 3
```

**Caching Layer:**
```
Redis Cache
    │
    ├─ NASA API responses (1 hour TTL)
    ├─ Calculation results (cache by params)
    └─ Session data
```

**CDN:**
```
CloudFlare / AWS CloudFront
    │
    ├─ Static assets (JS, CSS, images)
    ├─ Cached API responses
    └─ DDoS protection
```

## Performance Optimization

### Frontend
- Lazy loading
- Code splitting
- Asset minification
- Gzip compression
- Browser caching

### Backend
- Response caching
- Database indexing (if added)
- Connection pooling
- Async operations

### 3D Rendering
- Geometry instancing
- Level of detail (LOD)
- Frustum culling
- Texture optimization

## Monitoring & Logging

### Application Monitoring
```
PM2 → Process monitoring
    │
    ├─ CPU usage
    ├─ Memory usage
    ├─ Restart count
    └─ Logs
```

### Error Tracking
```
Sentry (optional)
    │
    ├─ JavaScript errors
    ├─ API errors
    ├─ Performance issues
    └─ User sessions
```

### Analytics
```
Google Analytics (optional)
    │
    ├─ Page views
    ├─ User interactions
    ├─ Calculation frequency
    └─ Popular scenarios
```

## Deployment Architecture

### Development
```
Local Machine
    │
    ├─ Node.js (localhost:3000)
    ├─ Flask (localhost:5000)
    └─ Browser (localhost:3000)
```

### Production
```
VPS / Cloud Server
    │
    ├─ Nginx (Port 80/443)
    │   └─ Reverse Proxy
    │       ├─ → Node.js (3000)
    │       └─ → Flask (5000)
    │
    ├─ PM2 (Process Manager)
    │   ├─ Node.js instances
    │   └─ Flask instances
    │
    └─ Let's Encrypt (SSL)
```

### Docker Architecture
```
Docker Compose
    │
    ├─ asteroid-simulator (Container)
    │   ├─ Node.js
    │   └─ Flask
    │
    └─ nginx (Container)
        └─ Reverse Proxy
```

## Technology Choices

### Why Node.js?
- Fast I/O for API gateway
- Large ecosystem (npm)
- Easy NASA API integration
- Good for real-time apps

### Why Flask?
- Excellent for scientific computing
- NumPy integration
- Simple and lightweight
- Python's math libraries

### Why Three.js?
- Industry standard for WebGL
- Large community
- Good documentation
- Performance optimized

### Why TailwindCSS?
- Utility-first approach
- Fast development
- Consistent design
- Easy customization

## Future Architecture

### Planned Additions

**Database Layer:**
```
PostgreSQL
    │
    ├─ User accounts
    ├─ Saved scenarios
    ├─ Calculation history
    └─ Leaderboards
```

**Message Queue:**
```
RabbitMQ / Redis
    │
    ├─ Long-running calculations
    ├─ Background jobs
    └─ Email notifications
```

**Microservices:**
```
API Gateway
    │
    ├─ NASA Service
    ├─ Calculation Service
    ├─ User Service
    └─ Notification Service
```

## Conclusion

The architecture is designed for:
- **Simplicity:** Easy to understand and deploy
- **Scalability:** Can grow with demand
- **Maintainability:** Clear separation of concerns
- **Performance:** Optimized for speed
- **Security:** Best practices implemented

---

**For implementation details, see the source code.**
