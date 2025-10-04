const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const NASA_NEO_BASE = 'https://api.nasa.gov/neo/rest/v1';
    const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
    let { start_date, end_date } = req.query;

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
    const params = { start_date, end_date, api_key: NASA_API_KEY };
    const response = await axios.get(url, { params });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NEO feed', message: error.message });
  }
};
