module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const {
      semi_major_axis,
      eccentricity,
      inclination,
      longitude_ascending_node,
      argument_periapsis,
      mean_anomaly_epoch,
      epoch_jd,
      num_points = 100,
    } = body;

    if (!semi_major_axis || eccentricity === undefined) {
      return res.status(400).json({ error: 'semi_major_axis and eccentricity are required' });
    }

    const orbit_points = [];
    const period_days = Math.sqrt(Math.pow(semi_major_axis, 3)) * 365.25;

    for (let i = 0; i < num_points; i += 1) {
      const mean_anomaly = (2 * Math.PI * i) / num_points;
      const eccentric_anomaly = solveKeplersEquation(mean_anomaly, eccentricity);
      const true_anomaly =
        2 *
        Math.atan2(
          Math.sqrt(1 + eccentricity) * Math.sin(eccentric_anomaly / 2),
          Math.sqrt(1 - eccentricity) * Math.cos(eccentric_anomaly / 2)
        );

      const radius = semi_major_axis * (1 - eccentricity * Math.cos(eccentric_anomaly));
      const x = radius * Math.cos(true_anomaly);
      const y = radius * Math.sin(true_anomaly);

      orbit_points.push({
        mean_anomaly: (mean_anomaly * 180) / Math.PI,
        true_anomaly: (true_anomaly * 180) / Math.PI,
        radius_au: radius,
        x_au: x,
        y_au: y,
        z_au: 0,
      });
    }

    res.status(200).json({
      orbital_elements: {
        semi_major_axis_au: semi_major_axis,
        eccentricity,
        inclination_deg: inclination || 0,
        longitude_ascending_node_deg: longitude_ascending_node || 0,
        argument_periapsis_deg: argument_periapsis || 0,
      },
      orbit_properties: {
        period_days,
        period_years: period_days / 365.25,
        perihelion_au: semi_major_axis * (1 - eccentricity),
        aphelion_au: semi_major_axis * (1 + eccentricity),
      },
      orbit_points,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate Keplerian orbit', message: error.message });
  }
};

function solveKeplersEquation(M, e, tolerance = 1e-6) {
  let E = M;
  let delta = 1;
  let iterations = 0;
  while (Math.abs(delta) > tolerance && iterations < 100) {
    delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    iterations += 1;
  }
  return E;
}
