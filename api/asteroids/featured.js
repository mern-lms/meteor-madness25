const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
    const NASA_NEO_BASE = 'https://api.nasa.gov/neo/rest/v1';

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    const startStr = today.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const url = `${NASA_NEO_BASE}/feed`;
    const response = await axios.get(url, {
      params: { start_date: startStr, end_date: endStr, api_key: NASA_API_KEY },
    });

    const neoData = response.data.near_earth_objects || {};
    const featured = [];
    for (const date in neoData) {
      const asteroids = neoData[date];
      asteroids.forEach((asteroid) => {
        if (asteroid.is_potentially_hazardous_asteroid) {
          featured.push({
            id: asteroid.id,
            name: asteroid.name,
            diameter_min:
              asteroid.estimated_diameter.meters.estimated_diameter_min,
            diameter_max:
              asteroid.estimated_diameter.meters.estimated_diameter_max,
            velocity: parseFloat(
              asteroid.close_approach_data[0]?.relative_velocity
                .kilometers_per_second || 0
            ),
            miss_distance: parseFloat(
              asteroid.close_approach_data[0]?.miss_distance.kilometers || 0
            ),
            close_approach_date:
              asteroid.close_approach_data[0]?.close_approach_date,
            is_hazardous: asteroid.is_potentially_hazardous_asteroid,
          });
        }
      });
    }

    featured.sort((a, b) => a.miss_distance - b.miss_distance);

    res.status(200).json({ count: featured.length, asteroids: featured.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured asteroids', message: error.message });
  }
};
