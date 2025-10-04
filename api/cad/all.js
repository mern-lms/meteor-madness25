const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { date_min, date_max, dist_max = '0.2' } = req.query;
    const url = 'https://ssd-api.jpl.nasa.gov/cad.api';
    const params = { 'dist-max': dist_max, sort: 'dist' };
    if (date_min) params['date-min'] = date_min;
    if (date_max) params['date-max'] = date_max;
    const response = await axios.get(url, { params });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch Close Approach Data',
      message: error.message,
      status: error.response?.status,
    });
  }
};
