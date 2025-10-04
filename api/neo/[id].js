const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const NASA_NEO_BASE = 'https://api.nasa.gov/neo/rest/v1';
    const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
    const { id } = req.query;
    const url = `${NASA_NEO_BASE}/neo/${id}`;
    const response = await axios.get(url, { params: { api_key: NASA_API_KEY } });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch NEO data',
      message: error.message,
      status: error.response?.status,
    });
  }
};
