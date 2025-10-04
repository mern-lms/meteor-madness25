const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const url = 'https://ssd-api.jpl.nasa.gov/cad.api';
    const params = {
      'date-min': '2020-01-01',
      'date-max': '2030-12-31',
      'dist-max': '0.5',
      sort: 'dist',
      limit,
      fullname: true,
    };
    const response = await axios.get(url, { params });
    const cadData = response.data;
    const transformedData = {
      signature: cadData.signature || { source: 'NASA/JPL CAD API', version: '1.0' },
      count: cadData.count || 0,
      data: cadData.data || [],
      fields: cadData.fields || [],
    };
    res.status(200).json(transformedData);
  } catch (error) {
    res.status(200).json({
      signature: { source: 'NASA/JPL SBDB API', version: '1.0' },
      count: 0,
      data: [],
      fields: [],
      error: error.message,
    });
  }
};
