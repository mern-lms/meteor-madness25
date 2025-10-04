// ==================== Regional Impact Maps ====================
// Advanced regional impact visualization with population density overlays

class RegionalImpactMapper {
    constructor() {
        this.map = null;
        this.impactCircles = [];
        this.populationLayer = null;
        this.isInitialized = false;
        this.currentImpactPoint = null;
        
        // Population density data (simplified - in real app would use actual APIs)
        this.populationCenters = [
            { name: "Tokyo", lat: 35.6762, lng: 139.6503, population: 37400000, type: "megacity" },
            { name: "Delhi", lat: 28.7041, lng: 77.1025, population: 30300000, type: "megacity" },
            { name: "Shanghai", lat: 31.2304, lng: 121.4737, population: 27100000, type: "megacity" },
            { name: "São Paulo", lat: -23.5505, lng: -46.6333, population: 22000000, type: "megacity" },
            { name: "Mexico City", lat: 19.4326, lng: -99.1332, population: 21700000, type: "megacity" },
            { name: "Cairo", lat: 30.0444, lng: 31.2357, population: 20900000, type: "megacity" },
            { name: "Mumbai", lat: 19.0760, lng: 72.8777, population: 20400000, type: "megacity" },
            { name: "Beijing", lat: 39.9042, lng: 116.4074, population: 20400000, type: "megacity" },
            { name: "Dhaka", lat: 23.8103, lng: 90.4125, population: 20300000, type: "megacity" },
            { name: "Osaka", lat: 34.6937, lng: 135.5023, population: 19300000, type: "megacity" },
            { name: "New York", lat: 40.7128, lng: -74.0060, population: 18800000, type: "megacity" },
            { name: "Karachi", lat: 24.8607, lng: 67.0011, population: 16100000, type: "megacity" },
            { name: "Buenos Aires", lat: -34.6118, lng: -58.3960, population: 15000000, type: "megacity" },
            { name: "Chongqing", lat: 29.4316, lng: 106.9123, population: 15000000, type: "megacity" },
            { name: "Istanbul", lat: 41.0082, lng: 28.9784, population: 15000000, type: "megacity" },
            { name: "Kolkata", lat: 22.5726, lng: 88.3639, population: 14900000, type: "megacity" },
            { name: "Manila", lat: 14.5995, lng: 120.9842, population: 13500000, type: "megacity" },
            { name: "Lagos", lat: 6.5244, lng: 3.3792, population: 13400000, type: "megacity" },
            { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, population: 13300000, type: "megacity" },
            { name: "Tianjin", lat: 39.3434, lng: 117.3616, population: 13200000, type: "megacity" }
        ];
        
        this.impactEffects = {
            crater: { color: '#ff0000', opacity: 0.8 },
            severe: { color: '#ff4500', opacity: 0.6 },
            moderate: { color: '#ffa500', opacity: 0.4 },
            light: { color: '#ffff00', opacity: 0.3 },
            seismic: { color: '#8a2be2', opacity: 0.2 }
        };
    }

    async initialize() {
        if (this.isInitialized) return;
        
        // Create map container
        const mapContainer = this.createMapContainer();
        
        // Initialize Leaflet map (using CDN)
        await this.loadLeafletLibrary();
        
        this.map = L.map('regional-impact-map').setView([20, 0], 2);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Add population centers
        this.addPopulationCenters();
        
        this.isInitialized = true;
    }

    async loadLeafletLibrary() {
        return new Promise((resolve) => {
            if (window.L) {
                resolve();
                return;
            }
            
            // Load Leaflet CSS
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(css);
            
            // Load Leaflet JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    createMapContainer() {
        // Check if container already exists
        let container = document.getElementById('regional-impact-container');
        if (container) return container;
        
        container = document.createElement('div');
        container.id = 'regional-impact-container';
        container.className = 'fixed inset-0 bg-black/90 z-50 hidden';
        container.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-gray-900 border-b border-gray-700 p-3 sm:p-4">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                        <div>
                            <h2 class="text-lg sm:text-xl font-bold text-white orbitron">🌍 Regional Impact Analysis</h2>
                            <p class="text-gray-400 text-xs sm:text-sm mt-1">Click anywhere on the map to simulate impact location</p>
                        </div>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div class="flex items-center gap-2">
                                <label class="text-white text-xs sm:text-sm">Show:</label>
                                <select id="impact-layer-select" class="bg-gray-800 text-white px-2 py-1 rounded text-xs sm:text-sm">
                                    <option value="all">All Effects</option>
                                    <option value="crater">Crater Only</option>
                                    <option value="blast">Blast Zones</option>
                                    <option value="seismic">Seismic Effects</option>
                                    <option value="population">Population Risk</option>
                                </select>
                            </div>
                            <button id="close-regional-map" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm self-end sm:self-auto">
                                ✕ Close
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="flex-1 relative">
                    <div id="regional-impact-map" class="w-full h-full"></div>
                    
                    <!-- Impact Info Panel -->
                    <div id="impact-info-panel" class="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 max-w-sm hidden">
                        <h3 class="text-lg font-bold text-blue-400 mb-2">Impact Analysis</h3>
                        <div id="impact-location" class="text-white mb-2"></div>
                        <div id="impact-effects" class="space-y-2 text-sm"></div>
                        <div id="population-risk" class="mt-3 p-2 bg-red-900/30 border border-red-500/50 rounded">
                            <div class="text-red-400 font-bold text-sm">Population at Risk</div>
                            <div id="risk-stats" class="text-white text-xs mt-1"></div>
                        </div>
                    </div>
                    
                    <!-- Legend -->
                    <div class="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-gray-500/30 rounded-lg p-3">
                        <h4 class="text-white font-bold text-sm mb-2">Impact Zones</h4>
                        <div class="space-y-1 text-xs">
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 bg-red-600 rounded-full"></div>
                                <span class="text-white">Crater</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 bg-orange-600 rounded-full opacity-60"></div>
                                <span class="text-white">Severe Damage</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 bg-yellow-600 rounded-full opacity-40"></div>
                                <span class="text-white">Moderate Damage</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 bg-purple-600 rounded-full opacity-20"></div>
                                <span class="text-white">Seismic Effects</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <span class="text-white">Population Centers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Event listeners
        document.getElementById('close-regional-map').addEventListener('click', () => {
            this.hide();
        });
        
        document.getElementById('impact-layer-select').addEventListener('change', (e) => {
            this.updateLayerVisibility(e.target.value);
        });
        
        return container;
    }

    addPopulationCenters() {
        this.populationCenters.forEach(center => {
            const size = Math.min(Math.max(center.population / 1000000 * 2, 5), 20);
            
            const marker = L.circleMarker([center.lat, center.lng], {
                radius: size,
                fillColor: '#3b82f6',
                color: '#1d4ed8',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.6
            }).addTo(this.map);
            
            marker.bindPopup(`
                <div class="text-center">
                    <h3 class="font-bold text-lg">${center.name}</h3>
                    <p class="text-sm text-gray-600">Population: ${(center.population / 1000000).toFixed(1)}M</p>
                    <p class="text-xs text-gray-500">${center.type}</p>
                </div>
            `);
        });
    }

    show() {
        if (!this.isInitialized) {
            this.initialize().then(() => {
                this.showMap();
            });
        } else {
            this.showMap();
        }
    }

    showMap() {
        document.getElementById('regional-impact-container').classList.remove('hidden');
        
        // Refresh map size
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
        
        // Add click handler for impact simulation
        this.map.on('click', (e) => {
            this.simulateImpactAt(e.latlng);
        });
    }

    hide() {
        document.getElementById('regional-impact-container').classList.add('hidden');
    }

    simulateImpactAt(latlng) {
        this.currentImpactPoint = latlng;
        
        // Clear previous impact circles
        this.clearImpactCircles();
        
        // Get current asteroid parameters
        const diameter = state.diameter;
        const velocity = state.velocity;
        const density = state.density;
        
        // Calculate impact effects (simplified)
        const effects = this.calculateRegionalEffects(diameter, velocity, density);
        
        // Draw impact circles
        this.drawImpactCircles(latlng, effects);
        
        // Update info panel
        this.updateInfoPanel(latlng, effects);
        
        // Calculate population at risk
        this.calculatePopulationRisk(latlng, effects);
    }

    calculateRegionalEffects(diameter, velocity, density) {
        // Simplified calculations based on current impact results
        const mass = (4/3) * Math.PI * Math.pow(diameter/2, 3) * density;
        const energy = 0.5 * mass * Math.pow(velocity * 1000, 2); // Joules
        const tntEquivalent = energy / (4.184e15); // Megatons
        
        // Crater radius (km)
        const craterRadius = Math.pow(tntEquivalent, 0.25) * 0.1;
        
        // Damage radii (km) - simplified scaling
        const severeRadius = craterRadius * 3;
        const moderateRadius = craterRadius * 6;
        const lightRadius = craterRadius * 12;
        const seismicRadius = craterRadius * 25;
        
        return {
            crater: craterRadius,
            severe: severeRadius,
            moderate: moderateRadius,
            light: lightRadius,
            seismic: seismicRadius,
            energy: tntEquivalent
        };
    }

    drawImpactCircles(latlng, effects) {
        const circles = [
            { radius: effects.crater, type: 'crater' },
            { radius: effects.severe, type: 'severe' },
            { radius: effects.moderate, type: 'moderate' },
            { radius: effects.light, type: 'light' },
            { radius: effects.seismic, type: 'seismic' }
        ];
        
        circles.forEach(circle => {
            if (circle.radius > 0) {
                const leafletCircle = L.circle([latlng.lat, latlng.lng], {
                    radius: circle.radius * 1000, // Convert km to meters
                    fillColor: this.impactEffects[circle.type].color,
                    color: this.impactEffects[circle.type].color,
                    weight: 2,
                    opacity: this.impactEffects[circle.type].opacity,
                    fillOpacity: this.impactEffects[circle.type].opacity * 0.5
                }).addTo(this.map);
                
                this.impactCircles.push(leafletCircle);
            }
        });
        
        // Add impact point marker
        const impactMarker = L.marker([latlng.lat, latlng.lng], {
            icon: L.divIcon({
                className: 'impact-marker',
                html: '💥',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(this.map);
        
        this.impactCircles.push(impactMarker);
    }

    clearImpactCircles() {
        this.impactCircles.forEach(circle => {
            this.map.removeLayer(circle);
        });
        this.impactCircles = [];
    }

    updateInfoPanel(latlng, effects) {
        const panel = document.getElementById('impact-info-panel');
        const locationEl = document.getElementById('impact-location');
        const effectsEl = document.getElementById('impact-effects');
        
        locationEl.innerHTML = `
            <strong>Impact Location:</strong><br>
            ${latlng.lat.toFixed(4)}°, ${latlng.lng.toFixed(4)}°
        `;
        
        effectsEl.innerHTML = `
            <div><strong>Crater:</strong> ${effects.crater.toFixed(1)} km radius</div>
            <div><strong>Severe Damage:</strong> ${effects.severe.toFixed(1)} km radius</div>
            <div><strong>Moderate Damage:</strong> ${effects.moderate.toFixed(1)} km radius</div>
            <div><strong>Seismic Effects:</strong> ${effects.seismic.toFixed(1)} km radius</div>
            <div><strong>Energy:</strong> ${effects.energy.toFixed(1)} MT TNT</div>
        `;
        
        panel.classList.remove('hidden');
    }

    calculatePopulationRisk(latlng, effects) {
        let totalRisk = 0;
        let affectedCities = [];
        
        this.populationCenters.forEach(city => {
            const distance = this.calculateDistance(latlng.lat, latlng.lng, city.lat, city.lng);
            
            let riskLevel = 'none';
            let riskFactor = 0;
            
            if (distance <= effects.crater) {
                riskLevel = 'total';
                riskFactor = 1.0;
            } else if (distance <= effects.severe) {
                riskLevel = 'severe';
                riskFactor = 0.8;
            } else if (distance <= effects.moderate) {
                riskLevel = 'moderate';
                riskFactor = 0.4;
            } else if (distance <= effects.light) {
                riskLevel = 'light';
                riskFactor = 0.1;
            } else if (distance <= effects.seismic) {
                riskLevel = 'seismic';
                riskFactor = 0.02;
            }
            
            if (riskFactor > 0) {
                const populationAtRisk = city.population * riskFactor;
                totalRisk += populationAtRisk;
                
                affectedCities.push({
                    name: city.name,
                    distance: distance,
                    riskLevel: riskLevel,
                    populationAtRisk: populationAtRisk
                });
            }
        });
        
        this.updateRiskStats(totalRisk, affectedCities);
    }

    updateRiskStats(totalRisk, affectedCities) {
        const riskStatsEl = document.getElementById('risk-stats');
        
        let statsHTML = `<div><strong>Total at Risk:</strong> ${(totalRisk / 1000000).toFixed(1)}M people</div>`;
        
        if (affectedCities.length > 0) {
            statsHTML += '<div class="mt-2"><strong>Affected Cities:</strong></div>';
            affectedCities.slice(0, 5).forEach(city => {
                const riskColor = {
                    'total': 'text-red-400',
                    'severe': 'text-orange-400',
                    'moderate': 'text-yellow-400',
                    'light': 'text-blue-400',
                    'seismic': 'text-purple-400'
                }[city.riskLevel];
                
                statsHTML += `
                    <div class="text-xs ${riskColor}">
                        ${city.name}: ${(city.populationAtRisk / 1000000).toFixed(1)}M (${city.riskLevel})
                    </div>
                `;
            });
        }
        
        riskStatsEl.innerHTML = statsHTML;
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    updateLayerVisibility(layerType) {
        // Implementation for showing/hiding different impact layers
        this.impactCircles.forEach((circle, index) => {
            if (circle.setStyle) { // It's a circle, not a marker
                const circleTypes = ['crater', 'severe', 'moderate', 'light', 'seismic'];
                const circleType = circleTypes[index % circleTypes.length];
                
                if (layerType === 'all' || layerType === circleType) {
                    circle.setStyle({ opacity: this.impactEffects[circleType].opacity });
                } else {
                    circle.setStyle({ opacity: 0.1 });
                }
            }
        });
    }
}

// Global instance
const regionalImpactMapper = new RegionalImpactMapper();

// Function to show regional impact map
function showRegionalImpactMap() {
    regionalImpactMapper.show();
}
