const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const url = 'https://data.nasa.gov/resource/b67r-rgxc.json';
    const response = await axios.get(url, { params: { $limit: 50 } });
    const comets = response.data.map((comet) => ({
      object_name: comet.object_name,
      epoch_tdb: comet.epoch_tdb,
      tp_tdb: comet.tp_tdb,
      e: parseFloat(comet.e),
      i_deg: parseFloat(comet.i_deg),
      w_deg: parseFloat(comet.w_deg),
      node_deg: parseFloat(comet.node_deg),
      q_au_1: parseFloat(comet.q_au_1),
      q_au_2: parseFloat(comet.q_au_2),
      p_yr: parseFloat(comet.p_yr),
      moid_au: parseFloat(comet.moid_au),
      ref: comet.ref,
      object_id: comet.object_id,
    }));
    res.status(200).json({
      count: comets.length,
      comets,
      data_source: 'NASA Open Data Portal - Near-Earth Comets',
      description: 'Keplerian orbital elements for near-Earth comets',
      coordinate_system: 'Heliocentric ecliptic coordinates',
    });
  } catch (error) {
    const demoComets = [
      { object_name: '1P/Halley', e: 0.967, i_deg: 162.3, q_au_1: 0.586, p_yr: 75.3, ref: 'JPL Small-Body Database' },
      { object_name: '2P/Encke', e: 0.848, i_deg: 11.8, q_au_1: 0.336, p_yr: 3.3, ref: 'JPL Small-Body Database' },
      { object_name: '55P/Tempel-Tuttle', e: 0.906, i_deg: 162.5, q_au_1: 0.982, p_yr: 33.2, ref: 'JPL Small-Body Database' },
    ];
    res.status(200).json({
      count: demoComets.length,
      comets: demoComets,
      data_source: 'Demo Data (NASA API unavailable)',
      description: 'Famous comets - fallback data',
      coordinate_system: 'Heliocentric ecliptic coordinates',
      note: `Original error: ${error.message}`,
    });
  }
};
