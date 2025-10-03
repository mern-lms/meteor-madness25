const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// NASA NEO API Base URL
const NASA_NEO_BASE = 'https://api.nasa.gov/neo/rest/v1';

// ==================== NASA NEO API Endpoints ====================

// Get NEO feed for a date range
app.get('/api/neo/feed', async (req, res) => {
    try {
        let { start_date, end_date } = req.query;
        
        // Default to today and 7 days ahead if not provided
        if (!start_date) {
            const today = new Date();
            start_date = today.toISOString().split('T')[0];
        }
        if (!end_date) {
            const endDate = new Date(start_date);
            endDate.setDate(endDate.getDate() + 7);
            end_date = endDate.toISOString().split('T')[0];
        }
        
        const url = `${NASA_NEO_BASE}/feed`;
        
        const params = {
            start_date: start_date,
            end_date: end_date,
            api_key: NASA_API_KEY
        };
        
        const response = await axios.get(url, { params });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching NEO feed:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch NEO feed',
            message: error.message 
        });
    }
});

// Browse NEO database (must come before /:id route)
app.get('/api/neo/browse', async (req, res) => {
    try {
        const { page = 0, size = 20 } = req.query;
        const url = `${NASA_NEO_BASE}/neo/browse`;
        
        console.log(`Browsing NEO database: page=${page}, size=${size}`);
        
        const response = await axios.get(url, {
            params: { 
                api_key: NASA_API_KEY,
                page,
                size
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error browsing NEO database:', error.response?.status, error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to browse NEO database',
            message: error.message,
            status: error.response?.status
        });
    }
});

// Get NEO statistics (must come before /:id route)
app.get('/api/neo/stats', async (req, res) => {
    try {
        // Correct NASA stats endpoint
        const url = `${NASA_NEO_BASE}/stats`;
        
        console.log('Fetching NEO stats from:', url);
        
        const response = await axios.get(url, {
            params: { 
                api_key: NASA_API_KEY
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching NEO stats:', error.response?.status, error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch NEO statistics',
            message: error.message,
            status: error.response?.status
        });
    }
});

// Get specific NEO by ID (wildcard route must come last)
app.get('/api/neo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const url = `${NASA_NEO_BASE}/neo/${id}`;
        
        console.log(`Fetching NEO by ID: ${id} from ${url}`);
        
        const response = await axios.get(url, {
            params: { api_key: NASA_API_KEY }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching NEO (ID: ${req.params.id}):`, error.response?.status, error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch NEO data',
            message: error.message,
            status: error.response?.status
        });
    }
});

// ==================== Custom Endpoints ====================

// Get featured/dangerous asteroids
app.get('/api/asteroids/featured', async (req, res) => {
    try {
        // Get today's date and 7 days ahead
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 7);
        
        const startStr = today.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        const url = `${NASA_NEO_BASE}/feed`;
        const response = await axios.get(url, {
            params: {
                start_date: startStr,
                end_date: endStr,
                api_key: NASA_API_KEY
            }
        });
        
        // Extract and process potentially hazardous asteroids
        const neoData = response.data.near_earth_objects;
        const featured = [];
        
        for (const date in neoData) {
            const asteroids = neoData[date];
            asteroids.forEach(asteroid => {
                if (asteroid.is_potentially_hazardous_asteroid) {
                    featured.push({
                        id: asteroid.id,
                        name: asteroid.name,
                        diameter_min: asteroid.estimated_diameter.meters.estimated_diameter_min,
                        diameter_max: asteroid.estimated_diameter.meters.estimated_diameter_max,
                        velocity: parseFloat(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || 0),
                        miss_distance: parseFloat(asteroid.close_approach_data[0]?.miss_distance.kilometers || 0),
                        close_approach_date: asteroid.close_approach_data[0]?.close_approach_date,
                        is_hazardous: asteroid.is_potentially_hazardous_asteroid
                    });
                }
            });
        }
        
        // Sort by closest approach
        featured.sort((a, b) => a.miss_distance - b.miss_distance);
        
        res.json({
            count: featured.length,
            asteroids: featured.slice(0, 10) // Top 10
        });
    } catch (error) {
        console.error('Error fetching featured asteroids:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch featured asteroids',
            message: error.message 
        });
    }
});

// Get sample asteroid data for simulation
app.get('/api/asteroids/samples', (req, res) => {
    const samples = [
        {
            id: 'sample_1',
            name: 'Impactor-2025 (Hypothetical)',
            diameter: 300, // meters
            velocity: 20, // km/s
            density: 3000, // kg/m³
            approach_angle: 45, // degrees
            description: 'A hypothetical 300m asteroid approaching at 20 km/s'
        },
        {
            id: 'sample_2',
            name: 'City Killer (Hypothetical)',
            diameter: 150,
            velocity: 25,
            density: 2500,
            approach_angle: 30,
            description: 'A smaller but faster asteroid capable of destroying a city'
        },
        {
            id: 'sample_3',
            name: 'Tunguska-Class',
            diameter: 60,
            velocity: 15,
            density: 2000,
            approach_angle: 20,
            description: 'Similar to the 1908 Tunguska event asteroid'
        },
        {
            id: 'sample_4',
            name: 'Chelyabinsk-Class',
            diameter: 20,
            velocity: 19,
            density: 1800,
            approach_angle: 18,
            description: 'Similar to the 2013 Chelyabinsk meteor'
        },
        {
            id: 'sample_5',
            name: 'Extinction Event',
            diameter: 10000,
            velocity: 30,
            density: 3500,
            approach_angle: 60,
            description: 'A 10km asteroid - similar to the dinosaur extinction event'
        }
    ];
    
    res.json({ samples });
});

// Get Sentry risk table data (potentially hazardous asteroids with impact probability)
app.get('/api/sentry/all', async (req, res) => {
    try {
        // NASA Sentry API for impact risk assessment
        const url = 'https://ssd-api.jpl.nasa.gov/sentry.api';
        
        const response = await axios.get(url);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Sentry data:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch Sentry risk data',
            message: error.message 
        });
    }
});

// Get specific Sentry object details
app.get('/api/sentry/:designation', async (req, res) => {
    try {
        const { designation } = req.params;
        const url = `https://ssd-api.jpl.nasa.gov/sentry.api`;
        
        const response = await axios.get(url, {
            params: { des: designation }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Sentry object:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch Sentry object data',
            message: error.message 
        });
    }
});

// SBDB Lookup - Get detailed orbital/physical data for a specific asteroid
app.get('/api/sbdb/lookup', async (req, res) => {
    try {
        const { sstr = 'ceres' } = req.query; // Small-body designation
        const url = 'https://ssd-api.jpl.nasa.gov/sbdb.api';
        
        console.log(`Looking up SBDB data for: ${sstr}`);
        
        const response = await axios.get(url, {
            params: { sstr }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching SBDB lookup:', error.response?.status, error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch SBDB lookup data',
            message: error.message,
            status: error.response?.status
        });
    }
});

// Get all asteroids from Small-Body Database (using CAD API instead)
app.get('/api/sbdb/all', async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        
        // Use CAD (Close Approach Data) API instead of SBDB Query
        // This is more reliable and doesn't require complex query syntax
        const url = 'https://ssd-api.jpl.nasa.gov/cad.api';
        
        const params = {
            'date-min': '2020-01-01',
            'date-max': '2030-12-31',
            'dist-max': '0.5', // Within 0.5 AU
            'sort': 'dist',
            'limit': limit,
            'fullname': true
        };
        
        console.log('Fetching SBDB/CAD data with params:', params);
        
        const response = await axios.get(url, { params });
        
        // Transform CAD data to match expected format
        const cadData = response.data;
        const transformedData = {
            signature: cadData.signature || { source: 'NASA/JPL CAD API', version: '1.0' },
            count: cadData.count || 0,
            data: cadData.data || [],
            fields: cadData.fields || []
        };
        
        res.json(transformedData);
    } catch (error) {
        console.error('Error fetching SBDB data:', error.response?.status, error.response?.data || error.message);
        // Return empty data instead of error to prevent frontend crashes
        res.json({ 
            signature: { source: 'NASA/JPL SBDB API', version: '1.0' },
            count: 0,
            data: [],
            fields: [],
            error: error.message
        });
    }
});

// Get close approach data for all asteroids
app.get('/api/cad/all', async (req, res) => {
    try {
        const { date_min, date_max, dist_max = '0.2' } = req.query;
        
        // Close Approach Data API
        const url = 'https://ssd-api.jpl.nasa.gov/cad.api';
        
        const params = {
            'dist-max': dist_max, // AU (use hyphenated parameter)
            sort: 'dist'
        };
        
        if (date_min) params['date-min'] = date_min;
        if (date_max) params['date-max'] = date_max;
        
        console.log('Fetching CAD data with params:', params);
        
        const response = await axios.get(url, { params });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching CAD data:', error.response?.status, error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch Close Approach Data',
            message: error.message,
            status: error.response?.status
        });
    }
});

// ==================== USGS Earthquake Catalog Integration ====================

// Get earthquake data for seismic impact modeling
app.get('/api/usgs/earthquakes', async (req, res) => {
    try {
        const { 
            magnitude_min = 6.0, 
            magnitude_max = 9.0, 
            limit = 100,
            days_back = 30 
        } = req.query;
        
        // Calculate date range
        const endTime = new Date();
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - parseInt(days_back));
        
        const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
        const params = {
            format: 'geojson',
            starttime: startTime.toISOString().split('T')[0],
            endtime: endTime.toISOString().split('T')[0],
            minmagnitude: magnitude_min,
            maxmagnitude: magnitude_max,
            limit: limit
        };
        
        console.log(`Fetching USGS earthquake data: mag ${magnitude_min}-${magnitude_max}, last ${days_back} days`);
        
        const response = await axios.get(url, { params });
        
        // Process earthquake data for impact modeling
        const earthquakes = response.data.features.map(eq => ({
            id: eq.id,
            magnitude: eq.properties.mag,
            location: eq.properties.place,
            time: new Date(eq.properties.time).toISOString(),
            coordinates: {
                longitude: eq.geometry.coordinates[0],
                latitude: eq.geometry.coordinates[1],
                depth: eq.geometry.coordinates[2]
            },
            url: eq.properties.url,
            tsunami: eq.properties.tsunami === 1
        }));
        
        res.json({
            count: earthquakes.length,
            earthquakes: earthquakes,
            query_params: {
                magnitude_range: `${magnitude_min}-${magnitude_max}`,
                days_back: days_back,
                limit: limit
            }
        });
    } catch (error) {
        console.error('Error fetching USGS earthquake data:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch earthquake data',
            message: error.message 
        });
    }
});

// Compare asteroid impact energy to historical earthquakes
app.post('/api/usgs/impact-seismic-comparison', async (req, res) => {
    try {
        const { energy_megatons, impact_location } = req.body;
        
        if (!energy_megatons) {
            return res.status(400).json({ error: 'energy_megatons is required' });
        }
        
        // Convert impact energy to equivalent earthquake magnitude
        // Using the relationship: log10(E) = 1.5M + 4.8 (where E is in Joules)
        const energy_joules = energy_megatons * 4.184e15; // Convert MT to Joules
        const equivalent_magnitude = (Math.log10(energy_joules) - 4.8) / 1.5;
        
        // Fetch recent earthquakes of similar magnitude
        const magnitude_range = 0.5;
        const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
        const params = {
            format: 'geojson',
            starttime: '2000-01-01',
            minmagnitude: Math.max(0, equivalent_magnitude - magnitude_range),
            maxmagnitude: equivalent_magnitude + magnitude_range,
            limit: 10,
            orderby: 'magnitude'
        };
        
        const response = await axios.get(url, { params });
        
        const similar_earthquakes = response.data.features.map(eq => ({
            magnitude: eq.properties.mag,
            location: eq.properties.place,
            date: new Date(eq.properties.time).toISOString().split('T')[0],
            casualties: eq.properties.alert || 'unknown',
            tsunami: eq.properties.tsunami === 1
        }));
        
        res.json({
            impact_energy: {
                megatons: energy_megatons,
                joules: energy_joules
            },
            equivalent_earthquake: {
                magnitude: Math.round(equivalent_magnitude * 10) / 10,
                description: getEarthquakeDescription(equivalent_magnitude)
            },
            similar_historical_events: similar_earthquakes,
            seismic_effects: {
                felt_radius_km: Math.pow(10, equivalent_magnitude - 3) * 100,
                damage_radius_km: Math.pow(10, equivalent_magnitude - 4) * 50,
                intensity_description: getIntensityDescription(equivalent_magnitude)
            }
        });
    } catch (error) {
        console.error('Error in seismic comparison:', error.message);
        res.status(500).json({ 
            error: 'Failed to perform seismic comparison',
            message: error.message 
        });
    }
});

// Helper function for earthquake descriptions
function getEarthquakeDescription(magnitude) {
    if (magnitude < 3.0) return "Micro - Not felt";
    if (magnitude < 4.0) return "Minor - Often felt, rarely causes damage";
    if (magnitude < 5.0) return "Light - Felt by most, minor damage";
    if (magnitude < 6.0) return "Moderate - Can cause damage to buildings";
    if (magnitude < 7.0) return "Strong - Can cause serious damage";
    if (magnitude < 8.0) return "Major - Can cause serious damage over large areas";
    if (magnitude < 9.0) return "Great - Can cause devastating damage";
    return "Extreme - Catastrophic destruction";
}

function getIntensityDescription(magnitude) {
    if (magnitude < 5.0) return "Minimal structural damage expected";
    if (magnitude < 6.0) return "Light to moderate structural damage";
    if (magnitude < 7.0) return "Moderate to heavy structural damage";
    if (magnitude < 8.0) return "Heavy structural damage, widespread destruction";
    return "Catastrophic destruction over vast areas";
}

// ==================== USGS Elevation Data Integration ====================

// Get elevation data for impact location
app.get('/api/usgs/elevation', async (req, res) => {
    try {
        const { latitude, longitude, units = 'Meters' } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({ 
                error: 'latitude and longitude are required' 
            });
        }
        
        // USGS Elevation Point Query Service
        const url = 'https://nationalmap.gov/epqs/pqs.php';
        const params = {
            x: longitude,
            y: latitude,
            units: units,
            output: 'json'
        };
        
        console.log(`Fetching elevation data for: ${latitude}, ${longitude}`);
        
        const response = await axios.get(url, { params });
        
        const elevation_data = response.data.USGS_Elevation_Point_Query_Service;
        
        res.json({
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            elevation: {
                value: elevation_data.Elevation_Query.Elevation,
                units: elevation_data.Elevation_Query.Units,
                data_source: elevation_data.Elevation_Query.Data_Source
            },
            crater_modeling: {
                base_elevation_m: elevation_data.Elevation_Query.Elevation,
                estimated_crater_depth_below_surface: "Calculated based on impact parameters",
                final_crater_elevation: "Base elevation minus crater depth"
            }
        });
    } catch (error) {
        console.error('Error fetching elevation data:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch elevation data',
            message: error.message 
        });
    }
});

// ==================== NASA Planetary Positions & Keplerian Orbits ====================

// Get current planetary positions using NASA's approximate formulas
app.get('/api/nasa/planetary-positions', (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        
        // Calculate Julian Day Number
        const jdn = getJulianDayNumber(targetDate);
        const T = (jdn - 2451545.0) / 36525.0; // Centuries since J2000.0
        
        // Planetary orbital elements (simplified - based on NASA's approximate positions)
        const planets = {
            mercury: calculatePlanetPosition('mercury', T),
            venus: calculatePlanetPosition('venus', T),
            earth: calculatePlanetPosition('earth', T),
            mars: calculatePlanetPosition('mars', T),
            jupiter: calculatePlanetPosition('jupiter', T),
            saturn: calculatePlanetPosition('saturn', T)
        };
        
        res.json({
            date: targetDate.toISOString(),
            julian_day: jdn,
            centuries_since_j2000: T,
            planetary_positions: planets,
            coordinate_system: "Heliocentric ecliptic coordinates (AU)",
            reference: "NASA Approximate Positions of the Planets"
        });
    } catch (error) {
        console.error('Error calculating planetary positions:', error.message);
        res.status(500).json({ 
            error: 'Failed to calculate planetary positions',
            message: error.message 
        });
    }
});

// Calculate Keplerian orbit for asteroids
app.post('/api/nasa/keplerian-orbit', (req, res) => {
    try {
        const { 
            semi_major_axis, 
            eccentricity, 
            inclination, 
            longitude_ascending_node, 
            argument_periapsis, 
            mean_anomaly_epoch,
            epoch_jd,
            num_points = 100 
        } = req.body;
        
        if (!semi_major_axis || eccentricity === undefined) {
            return res.status(400).json({ 
                error: 'semi_major_axis and eccentricity are required' 
            });
        }
        
        const orbit_points = [];
        const period_days = Math.sqrt(Math.pow(semi_major_axis, 3)) * 365.25;
        
        for (let i = 0; i < num_points; i++) {
            const mean_anomaly = (2 * Math.PI * i) / num_points;
            const eccentric_anomaly = solveKeplersEquation(mean_anomaly, eccentricity);
            const true_anomaly = 2 * Math.atan2(
                Math.sqrt(1 + eccentricity) * Math.sin(eccentric_anomaly / 2),
                Math.sqrt(1 - eccentricity) * Math.cos(eccentric_anomaly / 2)
            );
            
            const radius = semi_major_axis * (1 - eccentricity * Math.cos(eccentric_anomaly));
            
            // Convert to Cartesian coordinates
            const x = radius * Math.cos(true_anomaly);
            const y = radius * Math.sin(true_anomaly);
            
            orbit_points.push({
                mean_anomaly: mean_anomaly * 180 / Math.PI,
                true_anomaly: true_anomaly * 180 / Math.PI,
                radius_au: radius,
                x_au: x,
                y_au: y,
                z_au: 0 // Simplified 2D orbit
            });
        }
        
        res.json({
            orbital_elements: {
                semi_major_axis_au: semi_major_axis,
                eccentricity: eccentricity,
                inclination_deg: inclination || 0,
                longitude_ascending_node_deg: longitude_ascending_node || 0,
                argument_periapsis_deg: argument_periapsis || 0
            },
            orbit_properties: {
                period_days: period_days,
                period_years: period_days / 365.25,
                perihelion_au: semi_major_axis * (1 - eccentricity),
                aphelion_au: semi_major_axis * (1 + eccentricity)
            },
            orbit_points: orbit_points
        });
    } catch (error) {
        console.error('Error calculating Keplerian orbit:', error.message);
        res.status(500).json({ 
            error: 'Failed to calculate Keplerian orbit',
            message: error.message 
        });
    }
});

// Helper functions for orbital calculations
function getJulianDayNumber(date) {
    const a = Math.floor((14 - date.getMonth() - 1) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = date.getMonth() + 1 + 12 * a - 3;
    
    return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function calculatePlanetPosition(planet, T) {
    // Simplified orbital elements (NASA approximate positions)
    const elements = {
        mercury: { a: 0.38709927, e: 0.20563593, I: 7.00497902, L: 252.25032350, w: 77.45779628, W: 48.33076593 },
        venus: { a: 0.72333566, e: 0.00677672, I: 3.39467605, L: 181.97909950, w: 131.60246718, W: 76.67984255 },
        earth: { a: 1.00000261, e: 0.01671123, I: -0.00001531, L: 100.46457166, w: 102.93768193, W: 0.0 },
        mars: { a: 1.52371034, e: 0.09339410, I: 1.84969142, L: -4.55343205, w: -23.94362959, W: 49.55953891 },
        jupiter: { a: 5.20288700, e: 0.04838624, I: 1.30439695, L: 34.39644051, w: 14.72847983, W: 100.47390909 },
        saturn: { a: 9.53667594, e: 0.05386179, I: 2.48599187, L: 49.95424423, w: 92.59887831, W: 113.66242448 }
    };
    
    const elem = elements[planet];
    if (!elem) return null;
    
    // Calculate mean longitude
    const L = elem.L + T * 100; // Simplified rate
    const M = L - elem.w; // Mean anomaly
    
    // Solve Kepler's equation (simplified)
    const E = M + elem.e * Math.sin(M * Math.PI / 180) * 180 / Math.PI;
    
    // Calculate true anomaly
    const v = 2 * Math.atan2(
        Math.sqrt(1 + elem.e) * Math.sin(E * Math.PI / 360),
        Math.sqrt(1 - elem.e) * Math.cos(E * Math.PI / 360)
    ) * 180 / Math.PI;
    
    // Calculate radius
    const r = elem.a * (1 - elem.e * Math.cos(E * Math.PI / 180));
    
    // Convert to Cartesian coordinates (simplified)
    const x = r * Math.cos(v * Math.PI / 180);
    const y = r * Math.sin(v * Math.PI / 180);
    
    return {
        distance_au: r,
        x_au: x,
        y_au: y,
        z_au: 0,
        true_anomaly_deg: v,
        mean_anomaly_deg: M % 360
    };
}

function solveKeplersEquation(M, e, tolerance = 1e-6) {
    let E = M;
    let delta = 1;
    let iterations = 0;
    
    while (Math.abs(delta) > tolerance && iterations < 100) {
        delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E -= delta;
        iterations++;
    }
    
    return E;
}

// ==================== NASA Near-Earth Comets API ====================

// Get Near-Earth Comets orbital elements
app.get('/api/nasa/comets', async (req, res) => {
    try {
        // NASA Open Data Portal - Near-Earth Comets Orbital Elements
        const url = 'https://data.nasa.gov/resource/b67r-rgxc.json';
        
        console.log('Fetching Near-Earth Comets data from NASA Open Data Portal');
        
        const response = await axios.get(url, {
            params: {
                '$limit': 50 // Limit results for performance
            }
        });
        
        // Process comet data
        const comets = response.data.map(comet => ({
            object_name: comet.object_name,
            epoch_tdb: comet.epoch_tdb,
            tp_tdb: comet.tp_tdb,
            e: parseFloat(comet.e),
            i_deg: parseFloat(comet.i_deg),
            w_deg: parseFloat(comet.w_deg),
            node_deg: parseFloat(comet.node_deg),
            q_au_1: parseFloat(comet.q_au_1),
            q_au_2: parseFloat(comet.q_au_2),
            p_yr: parseFloat(comet.p_yr),
            moid_au: parseFloat(comet.moid_au),
            ref: comet.ref,
            object_id: comet.object_id
        }));
        
        res.json({
            count: comets.length,
            comets: comets,
            data_source: "NASA Open Data Portal - Near-Earth Comets",
            description: "Keplerian orbital elements for near-Earth comets",
            coordinate_system: "Heliocentric ecliptic coordinates"
        });
    } catch (error) {
        console.error('Error fetching comet data:', error.message);
        console.error('Full error:', error);
        
        // Provide fallback demo data
        const demoComets = [
            {
                object_name: "1P/Halley",
                e: 0.967,
                i_deg: 162.3,
                q_au_1: 0.586,
                p_yr: 75.3,
                ref: "JPL Small-Body Database"
            },
            {
                object_name: "2P/Encke", 
                e: 0.848,
                i_deg: 11.8,
                q_au_1: 0.336,
                p_yr: 3.3,
                ref: "JPL Small-Body Database"
            },
            {
                object_name: "55P/Tempel-Tuttle",
                e: 0.906,
                i_deg: 162.5,
                q_au_1: 0.982,
                p_yr: 33.2,
                ref: "JPL Small-Body Database"
            }
        ];
        
        res.json({
            count: demoComets.length,
            comets: demoComets,
            data_source: "Demo Data (NASA API unavailable)",
            description: "Famous comets - fallback data",
            coordinate_system: "Heliocentric ecliptic coordinates",
            note: `Original error: ${error.message}`
        });
    }
});

// Calculate comet trajectory using orbital elements
app.post('/api/nasa/comet-trajectory', (req, res) => {
    try {
        const { 
            perihelion_distance, 
            eccentricity, 
            inclination, 
            longitude_ascending_node, 
            argument_periapsis,
            num_points = 100 
        } = req.body;
        
        if (!perihelion_distance || eccentricity === undefined) {
            return res.status(400).json({ 
                error: 'perihelion_distance and eccentricity are required' 
            });
        }
        
        // Calculate semi-major axis from perihelion distance and eccentricity
        const semi_major_axis = perihelion_distance / (1 - eccentricity);
        
        const orbit_points = [];
        const period_years = Math.sqrt(Math.pow(semi_major_axis, 3));
        
        for (let i = 0; i < num_points; i++) {
            const mean_anomaly = (2 * Math.PI * i) / num_points;
            const eccentric_anomaly = solveKeplersEquation(mean_anomaly, eccentricity);
            const true_anomaly = 2 * Math.atan2(
                Math.sqrt(1 + eccentricity) * Math.sin(eccentric_anomaly / 2),
                Math.sqrt(1 - eccentricity) * Math.cos(eccentric_anomaly / 2)
            );
            
            const radius = semi_major_axis * (1 - eccentricity * Math.cos(eccentric_anomaly));
            
            // Convert to Cartesian coordinates
            const x = radius * Math.cos(true_anomaly);
            const y = radius * Math.sin(true_anomaly);
            
            orbit_points.push({
                mean_anomaly: mean_anomaly * 180 / Math.PI,
                true_anomaly: true_anomaly * 180 / Math.PI,
                radius_au: radius,
                x_au: x,
                y_au: y,
                z_au: 0
            });
        }
        
        res.json({
            comet_properties: {
                perihelion_distance_au: perihelion_distance,
                aphelion_distance_au: semi_major_axis * (1 + eccentricity),
                semi_major_axis_au: semi_major_axis,
                eccentricity: eccentricity,
                orbital_period_years: period_years
            },
            orbit_points: orbit_points,
            classification: eccentricity >= 1.0 ? "Hyperbolic (non-periodic)" : "Elliptical (periodic)"
        });
    } catch (error) {
        console.error('Error calculating comet trajectory:', error.message);
        res.status(500).json({ 
            error: 'Failed to calculate comet trajectory',
            message: error.message 
        });
    }
});

// ==================== Canadian Space Agency NEOSSAT Integration ====================

// Get NEOSSAT observation data (simulated - actual data requires special access)
app.get('/api/csa/neossat', async (req, res) => {
    try {
        const { target_type = 'asteroid', limit = 20 } = req.query;
        
        // Note: Real NEOSSAT data requires special access through CSA
        // This provides simulated data structure based on NEOSSAT capabilities
        
        const simulated_observations = [];
        
        for (let i = 0; i < limit; i++) {
            const observation = {
                observation_id: `NEOSSAT_${Date.now()}_${i}`,
                target_type: target_type,
                target_designation: `${target_type.toUpperCase()}_${2020000 + i}`,
                observation_time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                right_ascension_deg: Math.random() * 360,
                declination_deg: (Math.random() - 0.5) * 180,
                magnitude: 15 + Math.random() * 10,
                position_uncertainty_arcsec: 0.1 + Math.random() * 0.5,
                telescope: "NEOSSAT",
                filter: "Clear",
                exposure_time_sec: 30 + Math.random() * 120,
                tracking_status: Math.random() > 0.2 ? "Confirmed" : "Pending",
                orbit_determination_quality: Math.random() > 0.3 ? "Good" : "Fair"
            };
            
            simulated_observations.push(observation);
        }
        
        res.json({
            count: simulated_observations.length,
            observations: simulated_observations,
            telescope_info: {
                name: "Near-Earth Object Surveillance Satellite (NEOSSAT)",
                operator: "Canadian Space Agency (CSA)",
                mission: "World's first space telescope dedicated to detecting and tracking asteroids, comets, satellites and space debris",
                orbit: "Sun-synchronous polar orbit at 800 km altitude",
                capabilities: [
                    "Asteroid and comet detection",
                    "Space debris tracking", 
                    "Satellite surveillance",
                    "Exoplanet detection"
                ]
            },
            data_note: "This is simulated NEOSSAT data. Real observations require special access through CSA.",
            reference: "https://www.asc-csa.gc.ca/eng/satellites/neossat/"
        });
    } catch (error) {
        console.error('Error generating NEOSSAT data:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate NEOSSAT observation data',
            message: error.message 
        });
    }
});

// ==================== NASA Elliptical Orbit Simulator Implementation ====================

// Advanced orbital propagator based on NASA's tutorial
app.post('/api/nasa/orbit-propagator', (req, res) => {
    try {
        const {
            semi_major_axis,
            eccentricity,
            inclination = 0,
            longitude_ascending_node = 0,
            argument_periapsis = 0,
            mean_anomaly_epoch = 0,
            epoch_jd = 2451545.0, // J2000.0
            target_jd,
            num_points = 360
        } = req.body;
        
        if (!semi_major_axis || eccentricity === undefined) {
            return res.status(400).json({ 
                error: 'semi_major_axis and eccentricity are required' 
            });
        }
        
        const current_jd = target_jd || (Date.now() / 86400000 + 2440587.5);
        const time_since_epoch = current_jd - epoch_jd;
        
        // Calculate mean motion (radians per day)
        const n = 2 * Math.PI / Math.sqrt(Math.pow(semi_major_axis, 3)) / 365.25;
        
        // Current mean anomaly
        const current_mean_anomaly = mean_anomaly_epoch + n * time_since_epoch;
        
        const orbit_data = [];
        
        for (let i = 0; i < num_points; i++) {
            const M = current_mean_anomaly + (2 * Math.PI * i) / num_points;
            const E = solveKeplersEquation(M, eccentricity);
            const v = 2 * Math.atan2(
                Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
                Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
            );
            
            const r = semi_major_axis * (1 - eccentricity * Math.cos(E));
            
            // Orbital plane coordinates
            const x_orbital = r * Math.cos(v);
            const y_orbital = r * Math.sin(v);
            
            // Convert to 3D space (simplified rotation)
            const cos_i = Math.cos(inclination * Math.PI / 180);
            const sin_i = Math.sin(inclination * Math.PI / 180);
            const cos_omega = Math.cos(argument_periapsis * Math.PI / 180);
            const sin_omega = Math.sin(argument_periapsis * Math.PI / 180);
            const cos_Omega = Math.cos(longitude_ascending_node * Math.PI / 180);
            const sin_Omega = Math.sin(longitude_ascending_node * Math.PI / 180);
            
            const x = (cos_omega * cos_Omega - sin_omega * sin_Omega * cos_i) * x_orbital +
                     (-sin_omega * cos_Omega - cos_omega * sin_Omega * cos_i) * y_orbital;
            const y = (cos_omega * sin_Omega + sin_omega * cos_Omega * cos_i) * x_orbital +
                     (-sin_omega * sin_Omega + cos_omega * cos_Omega * cos_i) * y_orbital;
            const z = (sin_omega * sin_i) * x_orbital + (cos_omega * sin_i) * y_orbital;
            
            orbit_data.push({
                time_index: i,
                mean_anomaly_deg: M * 180 / Math.PI,
                eccentric_anomaly_deg: E * 180 / Math.PI,
                true_anomaly_deg: v * 180 / Math.PI,
                radius_au: r,
                x_au: x,
                y_au: y,
                z_au: z,
                orbital_velocity_km_s: Math.sqrt(398600.4418 * (2/r - 1/semi_major_axis)) / 149597870.7 // Approximate
            });
        }
        
        res.json({
            orbital_elements: {
                semi_major_axis_au: semi_major_axis,
                eccentricity: eccentricity,
                inclination_deg: inclination,
                longitude_ascending_node_deg: longitude_ascending_node,
                argument_periapsis_deg: argument_periapsis,
                mean_anomaly_epoch_deg: mean_anomaly_epoch * 180 / Math.PI
            },
            epoch_info: {
                epoch_jd: epoch_jd,
                current_jd: current_jd,
                time_since_epoch_days: time_since_epoch
            },
            orbit_properties: {
                period_days: Math.sqrt(Math.pow(semi_major_axis, 3)) * 365.25,
                perihelion_au: semi_major_axis * (1 - eccentricity),
                aphelion_au: semi_major_axis * (1 + eccentricity),
                mean_motion_deg_per_day: n * 180 / Math.PI
            },
            orbit_data: orbit_data,
            reference: "Based on NASA Elliptical Orbit Simulator algorithms"
        });
    } catch (error) {
        console.error('Error in orbit propagator:', error.message);
        res.status(500).json({ 
            error: 'Failed to propagate orbit',
            message: error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        nasa_api_key: NASA_API_KEY !== 'DEMO_KEY' ? 'configured' : 'using_demo_key',
        integrations: {
            nasa_neo: 'active',
            nasa_comets: 'active',
            usgs_earthquakes: 'active',
            usgs_elevation: 'active',
            planetary_positions: 'active',
            keplerian_orbits: 'active',
            orbit_propagator: 'active',
            csa_neossat: 'active'
        }
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Asteroid Impact Simulator Server running on http://localhost:${PORT}`);
    console.log(`📡 NASA API Key: ${NASA_API_KEY === 'DEMO_KEY' ? 'DEMO_KEY (limited)' : 'Custom key configured'}`);
    console.log(`\n🌍 Open http://localhost:${PORT} in your browser to start`);
});
