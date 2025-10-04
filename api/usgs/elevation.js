const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { latitude, longitude, units = 'Meters' } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }
    const url = 'https://nationalmap.gov/epqs/pqs.php';
    const params = { x: longitude, y: latitude, units, output: 'json' };
    const response = await axios.get(url, { params });
    const elevation_data = response.data.USGS_Elevation_Point_Query_Service;
    res.status(200).json({
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      elevation: {
        value: elevation_data.Elevation_Query.Elevation,
        units: elevation_data.Elevation_Query.Units,
        data_source: elevation_data.Elevation_Query.Data_Source,
      },
      crater_modeling: {
        base_elevation_m: elevation_data.Elevation_Query.Elevation,
        estimated_crater_depth_below_surface: 'Calculated based on impact parameters',
        final_crater_elevation: 'Base elevation minus crater depth',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch elevation data', message: error.message });
  }
};
