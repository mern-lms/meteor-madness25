const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { magnitude_min = 6.0, magnitude_max = 9.0, limit = 100, days_back = 30 } = req.query;
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - parseInt(days_back));
    const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
    const params = {
      format: 'geojson',
      starttime: startTime.toISOString().split('T')[0],
      endtime: endTime.toISOString().split('T')[0],
      minmagnitude: magnitude_min,
      maxmagnitude: magnitude_max,
      limit,
    };
    const response = await axios.get(url, { params });
    const earthquakes = response.data.features.map((eq) => ({
      id: eq.id,
      magnitude: eq.properties.mag,
      location: eq.properties.place,
      time: new Date(eq.properties.time).toISOString(),
      coordinates: {
        longitude: eq.geometry.coordinates[0],
        latitude: eq.geometry.coordinates[1],
        depth: eq.geometry.coordinates[2],
      },
      url: eq.properties.url,
      tsunami: eq.properties.tsunami === 1,
    }));
    res.status(200).json({
      count: earthquakes.length,
      earthquakes,
      query_params: {
        magnitude_range: `${magnitude_min}-${magnitude_max}`,
        days_back,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch earthquake data', message: error.message });
  }
};
