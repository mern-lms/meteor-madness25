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
      inclination = 0,
      longitude_ascending_node = 0,
      argument_periapsis = 0,
      mean_anomaly_epoch = 0,
      epoch_jd = 2451545.0,
      target_jd,
      num_points = 360,
    } = body;

    if (!semi_major_axis || eccentricity === undefined) {
      return res.status(400).json({ error: 'semi_major_axis and eccentricity are required' });
    }

    const current_jd = target_jd || Date.now() / 86400000 + 2440587.5;
    const time_since_epoch = current_jd - epoch_jd;
    const n = (2 * Math.PI) / Math.sqrt(Math.pow(semi_major_axis, 3)) / 365.25;
    const current_mean_anomaly = mean_anomaly_epoch + n * time_since_epoch;

    const orbit_data = [];
    for (let i = 0; i < num_points; i += 1) {
      const M = current_mean_anomaly + (2 * Math.PI * i) / num_points;
      const E = solveKeplersEquation(M, eccentricity);
      const v =
        2 *
        Math.atan2(
          Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
          Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
        );
      const r = semi_major_axis * (1 - eccentricity * Math.cos(E));
      const x_orbital = r * Math.cos(v);
      const y_orbital = r * Math.sin(v);

      const cos_i = Math.cos((inclination * Math.PI) / 180);
      const sin_i = Math.sin((inclination * Math.PI) / 180);
      const cos_omega = Math.cos((argument_periapsis * Math.PI) / 180);
      const sin_omega = Math.sin((argument_periapsis * Math.PI) / 180);
      const cos_Omega = Math.cos((longitude_ascending_node * Math.PI) / 180);
      const sin_Omega = Math.sin((longitude_ascending_node * Math.PI) / 180);

      const x =
        (cos_omega * cos_Omega - sin_omega * sin_Omega * cos_i) * x_orbital +
        (-sin_omega * cos_Omega - cos_omega * sin_Omega * cos_i) * y_orbital;
      const y =
        (cos_omega * sin_Omega + sin_omega * cos_Omega * cos_i) * x_orbital +
        (-sin_omega * sin_Omega + cos_omega * cos_Omega * cos_i) * y_orbital;
      const z = sin_omega * sin_i * x_orbital + cos_omega * sin_i * y_orbital;

      orbit_data.push({
        time_index: i,
        mean_anomaly_deg: (M * 180) / Math.PI,
        eccentric_anomaly_deg: (E * 180) / Math.PI,
        true_anomaly_deg: (v * 180) / Math.PI,
        radius_au: r,
        x_au: x,
        y_au: y,
        z_au: z,
        orbital_velocity_km_s:
          Math.sqrt(398600.4418 * (2 / r - 1 / semi_major_axis)) / 149597870.7,
      });
    }

    res.status(200).json({
      orbital_elements: {
        semi_major_axis_au: semi_major_axis,
        eccentricity,
        inclination_deg: inclination,
        longitude_ascending_node_deg: longitude_ascending_node,
        argument_periapsis_deg: argument_periapsis,
        mean_anomaly_epoch_deg: (mean_anomaly_epoch * 180) / Math.PI,
      },
      epoch_info: {
        epoch_jd,
        current_jd,
        time_since_epoch_days: time_since_epoch,
      },
      orbit_properties: {
        period_days: Math.sqrt(Math.pow(semi_major_axis, 3)) * 365.25,
        perihelion_au: semi_major_axis * (1 - eccentricity),
        aphelion_au: semi_major_axis * (1 + eccentricity),
        mean_motion_deg_per_day: (n * 180) / Math.PI,
      },
      orbit_data,
      reference: 'Based on NASA Elliptical Orbit Simulator algorithms',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to propagate orbit', message: error.message });
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
