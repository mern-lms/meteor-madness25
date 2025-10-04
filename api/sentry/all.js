const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const url = 'https://ssd-api.jpl.nasa.gov/sentry.api';
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Sentry risk data', message: error.message });
  }
};
