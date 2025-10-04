const axios = require('axios');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { energy_megatons, impact_location } = body;
    if (!energy_megatons) {
      return res.status(400).json({ error: 'energy_megatons is required' });
    }
    const energy_joules = energy_megatons * 4.184e15;
    const equivalent_magnitude = (Math.log10(energy_joules) - 4.8) / 1.5;
    const magnitude_range = 0.5;
    const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
    const params = {
      format: 'geojson',
      starttime: '2000-01-01',
      minmagnitude: Math.max(0, equivalent_magnitude - magnitude_range),
      maxmagnitude: equivalent_magnitude + magnitude_range,
      limit: 10,
      orderby: 'magnitude',
    };
    const response = await axios.get(url, { params });
    const similar_earthquakes = response.data.features.map((eq) => ({
      magnitude: eq.properties.mag,
      location: eq.properties.place,
      date: new Date(eq.properties.time).toISOString().split('T')[0],
      casualties: eq.properties.alert || 'unknown',
      tsunami: eq.properties.tsunami === 1,
    }));
    res.status(200).json({
      impact_energy: { megatons: energy_megatons, joules: energy_joules },
      equivalent_earthquake: {
        magnitude: Math.round(equivalent_magnitude * 10) / 10,
        description: getIntensityDescription(equivalent_magnitude),
      },
      similar_historical_events: similar_earthquakes,
      seismic_effects: {
        felt_radius_km: Math.pow(10, equivalent_magnitude - 3) * 100,
        damage_radius_km: Math.pow(10, equivalent_magnitude - 4) * 50,
        intensity_description: getIntensityDescription(equivalent_magnitude),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform seismic comparison', message: error.message });
  }
};

function getIntensityDescription(magnitude) {
  if (magnitude < 5.0) return 'Minimal structural damage expected';
  if (magnitude < 6.0) return 'Light to moderate structural damage';
  if (magnitude < 7.0) return 'Moderate to heavy structural damage';
  if (magnitude < 8.0) return 'Heavy structural damage, widespread destruction';
  return 'Catastrophic destruction over vast areas';
}
