module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { diameter = 100, velocity = 20, density = 3000, angle = 45 } = body;
    const EARTH_GRAVITY = 9.81;
    const radius = diameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * density;
    const velocity_ms = velocity * 1000;
    const kinetic_energy = 0.5 * mass * Math.pow(velocity_ms, 2);
    const megatons_tnt = kinetic_energy / 4.184e15;
    const target_density = 2500;
    let crater_diameter =
      1.8 *
      Math.pow(density / target_density, 1 / 3) *
      Math.pow(diameter, 0.13) *
      Math.pow(velocity_ms, 0.44) *
      Math.pow(Math.sin((angle * Math.PI) / 180), 1 / 3) *
      Math.pow(EARTH_GRAVITY, -0.22);
    crater_diameter *= 20;
    const seismic_magnitude = 0.67 * Math.log10(kinetic_energy) - 5.87;
    const fireball_radius = 0.28 * Math.pow(megatons_tnt, 0.33);
    const thermal_radius = 0.66 * Math.pow(megatons_tnt, 0.41);
    const blast_radius_severe = 0.23 * Math.pow(megatons_tnt, 0.33);
    const blast_radius_moderate = 0.54 * Math.pow(megatons_tnt, 0.33);
    const tsunami_potential = diameter > 100 && velocity > 15 ? 'High' : diameter > 50 ? 'Moderate' : 'Low';

    res.status(200).json({
      asteroid: { diameter, mass, velocity, density, angle },
      energy: {
        joules: kinetic_energy,
        megatons_tnt: megatons_tnt,
        hiroshima_bombs: megatons_tnt / 0.015,
      },
      crater: {
        diameter_meters: crater_diameter,
        diameter_km: crater_diameter / 1000,
        depth_meters: crater_diameter / 3,
      },
      seismic: {
        magnitude: seismic_magnitude,
        description: getSeismicDescription(seismic_magnitude),
      },
      effects: {
        fireball_radius_km: fireball_radius,
        thermal_radius_km: thermal_radius,
        blast_radius_severe_km: blast_radius_severe,
        blast_radius_moderate_km: blast_radius_moderate,
        tsunami_potential,
      },
      classification: classifyImpact(diameter, megatons_tnt),
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
};

function getSeismicDescription(magnitude) {
  if (magnitude < 4) return 'Minor - Felt locally';
  if (magnitude < 5) return 'Light - Felt widely, minor damage';
  if (magnitude < 6) return 'Moderate - Significant damage in populated areas';
  if (magnitude < 7) return 'Strong - Major damage over large areas';
  if (magnitude < 8) return 'Great - Serious damage over very large areas';
  return 'Catastrophic - Devastating effects globally';
}

function classifyImpact(diameter, megatons) {
  if (diameter < 10) return { level: 'Negligible', description: 'Burns up in atmosphere, minimal ground effects', color: '#4ade80' };
  if (diameter < 50) return { level: 'Local', description: 'Local damage, similar to Chelyabinsk event', color: '#fbbf24' };
  if (diameter < 200) return { level: 'Regional', description: 'Regional devastation, city-killer', color: '#fb923c' };
  if (diameter < 1000) return { level: 'Continental', description: 'Continental effects, climate impact', color: '#f87171' };
  return { level: 'Global', description: 'Mass extinction event', color: '#dc2626' };
}
