const { getJulianDayNumber, calculatePlanetPosition } = require('../_utils/orbits');

module.exports = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const jdn = getJulianDayNumber(targetDate);
    const T = (jdn - 2451545.0) / 36525.0;
    const planets = {
      mercury: calculatePlanetPosition('mercury', T),
      venus: calculatePlanetPosition('venus', T),
      earth: calculatePlanetPosition('earth', T),
      mars: calculatePlanetPosition('mars', T),
      jupiter: calculatePlanetPosition('jupiter', T),
      saturn: calculatePlanetPosition('saturn', T),
    };
    res.status(200).json({
      date: targetDate.toISOString(),
      julian_day: jdn,
      centuries_since_j2000: T,
      planetary_positions: planets,
      coordinate_system: 'Heliocentric ecliptic coordinates (AU)',
      reference: 'NASA Approximate Positions of the Planets',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate planetary positions', message: error.message });
  }
};
