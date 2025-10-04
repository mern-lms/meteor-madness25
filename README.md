# 🌍 Asteroid Impact Simulator - Meteor Madness

An interactive web-based platform for exploring asteroid impact scenarios, predicting consequences, and evaluating mitigation strategies using real NASA and USGS datasets.

![Asteroid Impact Simulator](https://img.shields.io/badge/NASA-Space%20Apps-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### Core Capabilities
- **Real-Time NASA NEO Data Integration**: Fetch live near-Earth object data from NASA's API
- **🌟 Multiple Asteroids in 3D**: View up to 20 asteroids simultaneously with their orbital paths
- **🎯 Click-to-Select**: Click any asteroid in 3D view to see detailed information
- **📊 Asteroid Browser**: Browse through 50+ tracked asteroids with comprehensive data
- **3D Orbital Visualization**: Interactive Three.js-powered 3D visualization of asteroid trajectories
- **Impact Simulation**: Calculate crater size, seismic magnitude, and environmental effects
- **Mitigation Strategies**: Simulate deflection methods (kinetic impactors, gravity tractors, laser ablation)
- **Environmental Impact Modeling**: Tsunami zones, seismic activity, atmospheric effects
- **Interactive Controls**: Adjust asteroid parameters (size, velocity, trajectory) in real-time

### Educational Features
- **Tooltips & Infographics**: Demystify complex astronomical concepts
- **Scenario Library**: Pre-loaded "what-if" scenarios (e.g., Impactor-2025)
- **Gamified "Defend Earth" Mode**: Test deflection strategies under time pressure
- **Regional Impact Visualization**: Zoom into specific regions for localized effects

### Technical Highlights
- **Scientific Accuracy**: Based on established orbital mechanics and crater scaling laws
- **Responsive Design**: Modern UI with TailwindCSS and smooth animations
- **Performance Optimized**: Efficient rendering for complex 3D simulations
- **Accessibility**: Colorblind-friendly palettes, keyboard navigation

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Core web technologies
- **Three.js**: 3D visualization of orbital paths and Earth
- **D3.js**: 2D charts and impact zone maps
- **TailwindCSS**: Modern, responsive styling
- **Lucide Icons**: Clean, modern iconography

### Backend
- **Node.js + Express**: API server for NASA data integration
- **Python + Flask**: Physics calculations and impact modeling
- **Axios**: HTTP client for external APIs

### Data Sources
- **NASA NEO API**: Near-Earth Object data
- **NASA Horizons System**: Orbital elements
- **USGS Elevation Data**: Topography and tsunami modeling
- **USGS Seismic Data**: Earthquake impact zones

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- NASA API Key (get free at https://api.nasa.gov/)

### Setup

1. **Clone the repository**
```bash
cd "d:\astroid maddness"
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env and add your NASA_API_KEY
```

5. **Start the servers**

Terminal 1 - Node.js server:
```bash
npm start
```

Terminal 2 - Python Flask server:
```bash
python app.py
```

6. **Open in browser**
```
http://localhost:3000
```

## 🎮 Usage Guide

### Basic Simulation
1. **Select an Asteroid**: Choose from NASA's NEO database or create custom parameters
2. **Adjust Parameters**: Use sliders to modify size, velocity, and trajectory
3. **Run Simulation**: Watch the 3D orbital path and predicted impact zone
4. **Analyze Results**: View crater size, seismic magnitude, and environmental effects

### Mitigation Strategies
1. **Choose Strategy**: Select kinetic impactor, gravity tractor, or laser ablation
2. **Set Parameters**: Adjust deflection timing and force
3. **Compare Outcomes**: See how the trajectory changes and impact is avoided

### Defend Earth Mode (Gamified)
1. **Start Scenario**: Face an incoming asteroid threat
2. **Make Decisions**: Choose deflection strategy and timing under time pressure
3. **Save Earth**: Successfully redirect the asteroid to win
4. **Learn**: Review what worked and why

## 🧮 Scientific Models

### Orbital Mechanics
- Keplerian orbital elements (semi-major axis, eccentricity, inclination)
- Two-body problem approximation
- Position calculation using true anomaly

### Impact Energy
```
KE = 0.5 × m × v²
TNT equivalent = KE / 4.184 × 10¹² J
```

### Crater Scaling
Based on Holsapple & Housen (2007):
```
D = 1.8 × ρₐ^0.11 × ρₜ^-0.33 × g^-0.22 × L^0.13 × v^0.44 × E^0.29
```

### Environmental Effects
- **Tsunamis**: Coastal elevation analysis using USGS data
- **Seismic Waves**: Magnitude estimation from impact energy
- **Atmospheric Effects**: Dust ejection and climate impact

## 🎨 Features Breakdown

### Visualization Modes
- **3D Orbital View**: See asteroid path relative to Earth
- **Impact Map**: 2D map showing potential impact zones
- **Timeline View**: Track asteroid approach over time
- **Comparison View**: Side-by-side mitigation scenarios

### Data Layers
- Population density
- Coastal zones
- Seismic activity regions
- Major cities and infrastructure

### Export Options
- Share simulation results on social media
- Download impact reports (PDF)
- Export trajectory data (JSON/CSV)

## 🌟 Standout Features

1. **Real NASA Data**: Live integration with NASA's NEO API
2. **Interactive Storytelling**: Guided scenarios like "Impactor-2025"
3. **Educational Tooltips**: Learn while you explore
4. **Gamification**: Engaging "Defend Earth" challenge mode
5. **Regional Focus**: Zoom into cities for localized impact analysis
6. **Multiple Mitigation Methods**: Compare different deflection strategies
7. **Accessibility**: WCAG 2.1 compliant, colorblind-friendly
8. **Mobile Responsive**: Works on all devices

## 📚 API Endpoints

### Node.js Server (Port 3000)
- `GET /api/neo/feed`: Fetch NEO feed from NASA
- `GET /api/neo/:id`: Get specific asteroid data
- `GET /api/neo/browse`: Browse NEO database

### Python Flask Server (Port 5000)
- `POST /api/calculate/impact`: Calculate impact parameters
- `POST /api/calculate/trajectory`: Compute orbital trajectory
- `POST /api/calculate/mitigation`: Simulate deflection strategy
- `POST /api/calculate/crater`: Estimate crater dimensions

## 🔧 Configuration

### Asteroid Parameters
- **Size**: 10m - 10km diameter
- **Velocity**: 11 - 72 km/s (typical NEO range)
- **Density**: 1000 - 8000 kg/m³ (C-type to M-type)
- **Approach Angle**: 0° - 90° from horizontal

### Mitigation Options
- **Kinetic Impactor**: Δv = 0.01 - 1.0 cm/s
- **Gravity Tractor**: Long-duration, low-thrust
- **Laser Ablation**: Surface material ejection
- **Nuclear Deflection**: High-energy option (theoretical)

## 🤝 Contributing

This project was created for the NASA Space Apps Challenge 2025. Contributions are welcome!

## 📄 License

MIT License - feel free to use for educational and research purposes.

## 🙏 Acknowledgments

- **NASA**: For providing open data through the NEO API
- **USGS**: For geological and environmental datasets
- **JPL**: For orbital mechanics references
- **NASA Eyes on Asteroids**: For inspiration

## 📞 Support

For questions or issues, please open an issue on the repository.

---

**Built with 💙 for NASA Space Apps Challenge 2025 - Meteor Madness**
