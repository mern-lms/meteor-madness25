from flask import Flask, request, jsonify
from flask_cors import CORS
import math
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# ==================== Physical Constants ====================
G = 6.67430e-11  # Gravitational constant (m³/kg/s²)
EARTH_MASS = 5.972e24  # kg
EARTH_RADIUS = 6371000  # meters
AU = 1.496e11  # Astronomical Unit in meters
EARTH_GRAVITY = 9.81  # m/s²

# ==================== Orbital Mechanics ====================

def calculate_orbital_position(semi_major_axis, eccentricity, inclination, 
                               long_ascending_node, arg_periapsis, true_anomaly):
    """
    Calculate 3D position from Keplerian orbital elements
    Returns position in meters (x, y, z)
    """
    # Convert angles to radians
    i = math.radians(inclination)
    omega = math.radians(long_ascending_node)
    w = math.radians(arg_periapsis)
    nu = math.radians(true_anomaly)
    
    # Distance from focus
    r = semi_major_axis * (1 - eccentricity**2) / (1 + eccentricity * math.cos(nu))
    
    # Position in orbital plane
    x_orb = r * math.cos(nu)
    y_orb = r * math.sin(nu)
    
    # Rotation matrices to convert to ecliptic coordinates
    # Rotate by argument of periapsis
    x1 = x_orb * math.cos(w) - y_orb * math.sin(w)
    y1 = x_orb * math.sin(w) + y_orb * math.cos(w)
    z1 = 0
    
    # Rotate by inclination
    x2 = x1
    y2 = y1 * math.cos(i)
    z2 = y1 * math.sin(i)
    
    # Rotate by longitude of ascending node
    x3 = x2 * math.cos(omega) - y2 * math.sin(omega)
    y3 = x2 * math.sin(omega) + y2 * math.cos(omega)
    z3 = z2
    
    return {
        'x': x3,
        'y': y3,
        'z': z3,
        'distance': r
    }

@app.route('/api/calculate/trajectory', methods=['POST'])
def calculate_trajectory():
    """
    Calculate asteroid trajectory over time
    """
    try:
        data = request.json
        
        # Orbital elements (default values if not provided)
        semi_major_axis = data.get('semi_major_axis', 1.5 * AU)  # meters
        eccentricity = data.get('eccentricity', 0.1)
        inclination = data.get('inclination', 5)  # degrees
        long_ascending_node = data.get('long_ascending_node', 0)  # degrees
        arg_periapsis = data.get('arg_periapsis', 0)  # degrees
        
        # Time parameters
        num_points = data.get('num_points', 100)
        
        # Calculate positions along orbit
        trajectory = []
        for i in range(num_points):
            true_anomaly = (i / num_points) * 360  # degrees
            pos = calculate_orbital_position(
                semi_major_axis, eccentricity, inclination,
                long_ascending_node, arg_periapsis, true_anomaly
            )
            trajectory.append({
                'x': pos['x'] / AU,  # Convert to AU for visualization
                'y': pos['y'] / AU,
                'z': pos['z'] / AU,
                'true_anomaly': true_anomaly
            })
        
        return jsonify({
            'trajectory': trajectory,
            'orbital_period_days': calculate_orbital_period(semi_major_axis)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def calculate_orbital_period(semi_major_axis):
    """
    Calculate orbital period using Kepler's third law
    Returns period in days
    """
    # T² = (4π²/GM) * a³
    SUN_MASS = 1.989e30  # kg
    G_SUN = 6.67430e-11
    
    period_seconds = 2 * math.pi * math.sqrt(semi_major_axis**3 / (G_SUN * SUN_MASS))
    period_days = period_seconds / (24 * 3600)
    
    return period_days

# ==================== Impact Calculations ====================

@app.route('/api/calculate/impact', methods=['POST'])
def calculate_impact():
    """
    Calculate impact energy, crater size, and environmental effects
    """
    try:
        data = request.json
        
        # Asteroid parameters
        diameter = data.get('diameter', 100)  # meters
        velocity = data.get('velocity', 20)  # km/s
        density = data.get('density', 3000)  # kg/m³
        angle = data.get('angle', 45)  # degrees from horizontal
        
        # Calculate mass
        radius = diameter / 2
        volume = (4/3) * math.pi * (radius ** 3)
        mass = volume * density
        
        # Calculate kinetic energy
        velocity_ms = velocity * 1000  # Convert to m/s
        kinetic_energy = 0.5 * mass * (velocity_ms ** 2)  # Joules
        
        # Convert to megatons of TNT (1 megaton = 4.184 × 10^15 J)
        megatons_tnt = kinetic_energy / (4.184e15)
        
        # Crater diameter estimation (Holsapple & Housen scaling)
        # Simplified version: D ≈ 1.8 * (ρₐ/ρₜ)^(1/3) * L^0.13 * v^0.44 * sin(θ)^(1/3) * g^(-0.22)
        target_density = 2500  # kg/m³ (average rock)
        g = EARTH_GRAVITY
        
        crater_diameter = (1.8 * 
                          ((density / target_density) ** (1/3)) * 
                          (diameter ** 0.13) * 
                          (velocity_ms ** 0.44) * 
                          (math.sin(math.radians(angle)) ** (1/3)) * 
                          (g ** (-0.22)))
        
        # Scale up (empirical adjustment)
        crater_diameter *= 20
        
        # Seismic magnitude estimation
        # M = 0.67 * log10(E) - 5.87 (where E is in Joules)
        seismic_magnitude = 0.67 * math.log10(kinetic_energy) - 5.87
        
        # Fireball radius (rough estimate)
        fireball_radius = 0.28 * (megatons_tnt ** 0.33)  # km
        
        # Thermal radiation radius (3rd degree burns)
        thermal_radius = 0.66 * (megatons_tnt ** 0.41)  # km
        
        # Air blast radius (overpressure damage)
        blast_radius_severe = 0.23 * (megatons_tnt ** 0.33)  # km (20 psi)
        blast_radius_moderate = 0.54 * (megatons_tnt ** 0.33)  # km (5 psi)
        
        # Tsunami potential (if ocean impact)
        tsunami_potential = "High" if diameter > 100 and velocity > 15 else "Moderate" if diameter > 50 else "Low"
        
        # Impact classification
        impact_class = classify_impact(diameter, megatons_tnt)
        
        return jsonify({
            'asteroid': {
                'diameter': diameter,
                'mass': mass,
                'velocity': velocity,
                'density': density,
                'angle': angle
            },
            'energy': {
                'joules': kinetic_energy,
                'megatons_tnt': megatons_tnt,
                'hiroshima_bombs': megatons_tnt / 0.015  # Hiroshima was ~15 kilotons
            },
            'crater': {
                'diameter_meters': crater_diameter,
                'diameter_km': crater_diameter / 1000,
                'depth_meters': crater_diameter / 3  # Rough estimate
            },
            'seismic': {
                'magnitude': seismic_magnitude,
                'description': get_seismic_description(seismic_magnitude)
            },
            'effects': {
                'fireball_radius_km': fireball_radius,
                'thermal_radius_km': thermal_radius,
                'blast_radius_severe_km': blast_radius_severe,
                'blast_radius_moderate_km': blast_radius_moderate,
                'tsunami_potential': tsunami_potential
            },
            'classification': impact_class
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def classify_impact(diameter, megatons):
    """
    Classify impact severity
    """
    if diameter < 10:
        return {
            'level': 'Negligible',
            'description': 'Burns up in atmosphere, minimal ground effects',
            'color': '#4ade80'
        }
    elif diameter < 50:
        return {
            'level': 'Local',
            'description': 'Local damage, similar to Chelyabinsk event',
            'color': '#fbbf24'
        }
    elif diameter < 200:
        return {
            'level': 'Regional',
            'description': 'Regional devastation, city-killer',
            'color': '#fb923c'
        }
    elif diameter < 1000:
        return {
            'level': 'Continental',
            'description': 'Continental effects, climate impact',
            'color': '#f87171'
        }
    else:
        return {
            'level': 'Global',
            'description': 'Mass extinction event',
            'color': '#dc2626'
        }

def get_seismic_description(magnitude):
    """
    Get description of seismic effects
    """
    if magnitude < 4:
        return "Minor - Felt locally"
    elif magnitude < 5:
        return "Light - Felt widely, minor damage"
    elif magnitude < 6:
        return "Moderate - Significant damage in populated areas"
    elif magnitude < 7:
        return "Strong - Major damage over large areas"
    elif magnitude < 8:
        return "Great - Serious damage over very large areas"
    else:
        return "Catastrophic - Devastating effects globally"

# ==================== Mitigation Strategies ====================

@app.route('/api/calculate/mitigation', methods=['POST'])
def calculate_mitigation():
    """
    Calculate effects of deflection strategies
    """
    try:
        data = request.json
        
        # Asteroid parameters
        diameter = data.get('diameter', 100)  # meters
        velocity = data.get('velocity', 20)  # km/s
        density = data.get('density', 3000)  # kg/m³
        
        # Mitigation parameters
        strategy = data.get('strategy', 'kinetic_impactor')
        warning_time = data.get('warning_time', 10)  # years
        deflection_time = data.get('deflection_time', 5)  # years before impact
        
        # Calculate mass
        radius = diameter / 2
        volume = (4/3) * math.pi * (radius ** 3)
        mass = volume * density
        
        # Calculate required delta-v based on strategy
        if strategy == 'kinetic_impactor':
            # Kinetic impactor: Δv depends on impactor mass and velocity
            impactor_mass = data.get('impactor_mass', 1000)  # kg
            impactor_velocity = data.get('impactor_velocity', 10)  # km/s relative
            
            # Momentum transfer (simplified, assumes perfect inelastic collision)
            momentum_transfer = impactor_mass * impactor_velocity * 1000  # kg⋅m/s
            delta_v = momentum_transfer / mass  # m/s
            
            # Enhanced momentum (beta factor ~2-5 from ejecta)
            beta = 3
            delta_v_enhanced = delta_v * beta
            
        elif strategy == 'gravity_tractor':
            # Gravity tractor: Very slow but precise
            # Δv = (G * M_spacecraft * t) / (r² * M_asteroid)
            spacecraft_mass = data.get('spacecraft_mass', 20000)  # kg
            distance = 100  # meters
            tractor_time = deflection_time * 365.25 * 24 * 3600  # seconds
            
            delta_v_enhanced = (G * spacecraft_mass * tractor_time) / (distance**2 * mass)
            
        elif strategy == 'laser_ablation':
            # Laser ablation: Vaporize surface material
            laser_power = data.get('laser_power', 1e6)  # Watts
            ablation_time = deflection_time * 365.25 * 24 * 3600  # seconds
            
            # Simplified: assume 10% efficiency
            energy_delivered = laser_power * ablation_time * 0.1
            mass_ablated = energy_delivered / (2.5e6)  # J/kg (vaporization energy)
            
            # Rocket equation approximation
            exhaust_velocity = 1000  # m/s
            delta_v_enhanced = exhaust_velocity * math.log(mass / (mass - mass_ablated))
            
        elif strategy == 'nuclear':
            # Nuclear deflection: High energy, standoff detonation
            yield_megatons = data.get('nuclear_yield', 1)  # megatons
            standoff_distance = diameter * 3  # meters
            
            # Energy coupling (very rough estimate)
            energy_joules = yield_megatons * 4.184e15
            coupling_efficiency = 0.01  # 1% of energy transfers to momentum
            
            momentum_transfer = math.sqrt(2 * mass * energy_joules * coupling_efficiency)
            delta_v_enhanced = momentum_transfer / mass
            
        else:
            delta_v_enhanced = 0
        
        # Calculate deflection distance at Earth
        # Δx ≈ Δv * t (where t is time from deflection to impact)
        time_to_impact = deflection_time * 365.25 * 24 * 3600  # seconds
        deflection_distance = delta_v_enhanced * time_to_impact  # meters
        deflection_distance_km = deflection_distance / 1000
        
        # Calculate if deflection is successful (need to miss Earth)
        earth_radius_km = EARTH_RADIUS / 1000
        success = deflection_distance_km > earth_radius_km
        
        # Calculate new trajectory (simplified)
        # Assume deflection perpendicular to velocity
        velocity_ms = velocity * 1000
        deflection_angle = math.degrees(math.atan(delta_v_enhanced / velocity_ms))
        
        return jsonify({
            'strategy': strategy,
            'parameters': {
                'warning_time_years': warning_time,
                'deflection_time_years': deflection_time,
                'asteroid_mass_kg': mass
            },
            'results': {
                'delta_v_ms': delta_v_enhanced,
                'delta_v_cms': delta_v_enhanced * 100,  # cm/s
                'deflection_distance_km': deflection_distance_km,
                'deflection_angle_degrees': deflection_angle,
                'success': success,
                'success_margin_km': deflection_distance_km - earth_radius_km
            },
            'recommendation': get_mitigation_recommendation(
                success, deflection_distance_km, earth_radius_km
            )
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def get_mitigation_recommendation(success, deflection_km, earth_radius_km):
    """
    Provide recommendation based on mitigation results
    """
    if success:
        margin = deflection_km - earth_radius_km
        if margin > earth_radius_km * 2:
            return {
                'status': 'Excellent',
                'message': 'Deflection successful with large safety margin',
                'color': '#22c55e'
            }
        else:
            return {
                'status': 'Successful',
                'message': 'Deflection successful, asteroid will miss Earth',
                'color': '#4ade80'
            }
    else:
        deficit = earth_radius_km - deflection_km
        if deficit < earth_radius_km * 0.5:
            return {
                'status': 'Marginal',
                'message': 'Close call - consider additional deflection or earlier intervention',
                'color': '#fbbf24'
            }
        else:
            return {
                'status': 'Insufficient',
                'message': 'Deflection insufficient - need more powerful intervention or earlier action',
                'color': '#ef4444'
            }

# ==================== Crater Calculations ====================

@app.route('/api/calculate/crater', methods=['POST'])
def calculate_crater_detailed():
    """
    Detailed crater calculations with scaling laws
    """
    try:
        data = request.json
        
        diameter = data.get('diameter', 100)
        velocity = data.get('velocity', 20)
        density = data.get('density', 3000)
        angle = data.get('angle', 45)
        target_type = data.get('target_type', 'rock')  # rock, sand, ice
        
        # Target properties
        target_properties = {
            'rock': {'density': 2500, 'strength': 1e7},
            'sand': {'density': 1600, 'strength': 1e5},
            'ice': {'density': 920, 'strength': 1e6},
            'water': {'density': 1000, 'strength': 0}
        }
        
        target_density = target_properties.get(target_type, target_properties['rock'])['density']
        
        # Calculate projectile mass and energy
        radius = diameter / 2
        volume = (4/3) * math.pi * (radius ** 3)
        mass = volume * density
        velocity_ms = velocity * 1000
        energy = 0.5 * mass * (velocity_ms ** 2)
        
        # Crater scaling (simplified Holsapple & Housen)
        # For competent rock targets
        g = EARTH_GRAVITY
        L = diameter
        
        # Crater diameter
        crater_diameter = (1.161 * 
                          ((density / target_density) ** (1/3)) * 
                          (L ** 1.056) * 
                          ((velocity_ms / 1000) ** 0.44) * 
                          (math.sin(math.radians(angle)) ** (1/3)) * 
                          (g ** (-0.22)))
        
        # Crater depth (typically 1/5 to 1/3 of diameter)
        crater_depth = crater_diameter / 3
        
        # Ejecta blanket radius (typically 2-3 times crater diameter)
        ejecta_radius = crater_diameter * 2.5
        
        # Volume of excavated material
        crater_volume = (math.pi / 3) * ((crater_diameter / 2) ** 2) * crater_depth
        
        return jsonify({
            'crater': {
                'diameter_m': crater_diameter,
                'diameter_km': crater_diameter / 1000,
                'depth_m': crater_depth,
                'volume_m3': crater_volume,
                'ejecta_radius_m': ejecta_radius
            },
            'comparison': get_crater_comparison(crater_diameter)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def get_crater_comparison(diameter_m):
    """
    Compare crater size to known features
    """
    diameter_km = diameter_m / 1000
    
    if diameter_km < 0.1:
        return "Smaller than a football field"
    elif diameter_km < 1:
        return f"About {diameter_km:.1f} km - similar to Meteor Crater, Arizona"
    elif diameter_km < 10:
        return f"About {diameter_km:.1f} km - similar to Barringer Crater"
    elif diameter_km < 100:
        return f"About {diameter_km:.1f} km - similar to Chicxulub crater (dinosaur extinction)"
    else:
        return f"About {diameter_km:.1f} km - larger than most known impact craters"

# ==================== Health Check ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'service': 'Asteroid Impact Calculator'
    })

# ==================== Main ====================

if __name__ == '__main__':
    print("🧮 Starting Asteroid Impact Calculator (Flask)")
    print("📊 Endpoints available:")
    print("  - POST /api/calculate/trajectory")
    print("  - POST /api/calculate/impact")
    print("  - POST /api/calculate/mitigation")
    print("  - POST /api/calculate/crater")
    print("\n🚀 Server running on http://localhost:5000")
    
    app.run(debug=True, port=5000)
