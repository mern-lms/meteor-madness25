module.exports = async (req, res) => {
  const nasaKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    nasa_api_key: nasaKey !== 'DEMO_KEY' ? 'configured' : 'using_demo_key',
  });
};
