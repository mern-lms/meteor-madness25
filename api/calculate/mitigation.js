module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const EARTH_RADIUS_KM = 6371;
    const G = 6.67430e-11;
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const {
      diameter = 100,
      velocity = 20,
      density = 3000,
      strategy = 'kinetic_impactor',
      warning_time = 10,
      deflection_time = 5,
      impactor_mass = 1000,
      impactor_velocity = 10,
      spacecraft_mass = 20000,
      laser_power = 1e6,
      nuclear_yield = 1,
    } = body;

    const radius = diameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * density;

    let delta_v_enhanced = 0;
    if (strategy === 'kinetic_impactor') {
      const momentum_transfer = impactor_mass * impactor_velocity * 1000;
      const beta = 3;
      delta_v_enhanced = (momentum_transfer / mass) * beta;
    } else if (strategy === 'gravity_tractor') {
      const distance = 100; // meters
      const tractor_time = deflection_time * 365.25 * 24 * 3600;
      delta_v_enhanced = (G * spacecraft_mass * tractor_time) / (distance ** 2 * mass);
    } else if (strategy === 'laser_ablation') {
      const ablation_time = deflection_time * 365.25 * 24 * 3600;
      const energy_delivered = laser_power * ablation_time * 0.1;
      const mass_ablated = energy_delivered / 2.5e6;
      const exhaust_velocity = 1000; // m/s
      delta_v_enhanced = exhaust_velocity * Math.log(mass / (mass - mass_ablated));
    } else if (strategy === 'nuclear') {
      const energy_joules = nuclear_yield * 4.184e15;
      const coupling_efficiency = 0.01;
      const momentum_transfer = Math.sqrt(2 * mass * energy_joules * coupling_efficiency);
      delta_v_enhanced = momentum_transfer / mass;
    }

    const time_to_impact = deflection_time * 365.25 * 24 * 3600;
    const deflection_distance = delta_v_enhanced * time_to_impact;
    const deflection_distance_km = deflection_distance / 1000;
    const velocity_ms = velocity * 1000;
    const deflection_angle = (Math.atan(delta_v_enhanced / velocity_ms) * 180) / Math.PI;

    const success = deflection_distance_km > EARTH_RADIUS_KM;
    const recommendation = get_mitigation_recommendation(success, deflection_distance_km, EARTH_RADIUS_KM);

    res.status(200).json({
      strategy,
      parameters: { warning_time_years: warning_time, deflection_time_years: deflection_time, asteroid_mass_kg: mass },
      results: {
        delta_v_ms: delta_v_enhanced,
        delta_v_cms: delta_v_enhanced * 100,
        deflection_distance_km,
        deflection_angle_degrees: deflection_angle,
        success,
        success_margin_km: deflection_distance_km - EARTH_RADIUS_KM,
      },
      recommendation,
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
};

function get_mitigation_recommendation(success, deflection_km, earth_radius_km) {
  if (success) {
    const margin = deflection_km - earth_radius_km;
    if (margin > earth_radius_km * 2) {
      return { status: 'Excellent', message: 'Deflection successful with large safety margin', color: '#22c55e' };
    }
    return { status: 'Successful', message: 'Deflection successful, asteroid will miss Earth', color: '#4ade80' };
  }
  const deficit = earth_radius_km - deflection_km;
  if (deficit < earth_radius_km * 0.5) {
    return { status: 'Marginal', message: 'Close call - consider additional deflection or earlier intervention', color: '#fbbf24' };
  }
  return { status: 'Insufficient', message: 'Deflection insufficient - need more powerful intervention or earlier action', color: '#ef4444' };
}
