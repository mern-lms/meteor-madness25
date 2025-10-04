const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { sstr = 'ceres' } = req.query;
    const url = 'https://ssd-api.jpl.nasa.gov/sbdb.api';
    const response = await axios.get(url, { params: { sstr } });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch SBDB lookup data',
      message: error.message,
      status: error.response?.status,
    });
  }
};
