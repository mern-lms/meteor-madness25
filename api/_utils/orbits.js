// Shared orbital mechanics utilities for serverless functions

function getJulianDayNumber(date) {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;
  return (
    date.getDate() +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function calculatePlanetPosition(planet, T) {
  const elements = {
    mercury: { a: 0.38709927, e: 0.20563593, I: 7.00497902, L: 252.2503235, w: 77.45779628, W: 48.33076593 },
    venus:   { a: 0.72333566, e: 0.00677672, I: 3.39467605, L: 181.9790995, w: 131.60246718, W: 76.67984255 },
    earth:   { a: 1.00000261, e: 0.01671123, I: -0.00001531, L: 100.46457166, w: 102.93768193, W: 0.0 },
    mars:    { a: 1.52371034, e: 0.0933941,  I: 1.84969142, L: -4.55343205, w: -23.94362959, W: 49.55953891 },
    jupiter: { a: 5.202887,   e: 0.04838624, I: 1.30439695, L: 34.39644051, w: 14.72847983, W: 100.47390909 },
    saturn:  { a: 9.53667594, e: 0.05386179, I: 2.48599187, L: 49.95424423, w: 92.59887831, W: 113.66242448 },
  };
  const elem = elements[planet];
  if (!elem) return null;
  const L = elem.L + T * 100;
  const M = L - elem.w;
  const E = M + (elem.e * Math.sin((M * Math.PI) / 180)) * (180 / Math.PI);
  const v =
    (2 *
      Math.atan2(
        Math.sqrt(1 + elem.e) * Math.sin((E * Math.PI) / 360),
        Math.sqrt(1 - elem.e) * Math.cos((E * Math.PI) / 360)
      ) *
      180) /
    Math.PI;
  const r = elem.a * (1 - elem.e * Math.cos((E * Math.PI) / 180));
  const x = r * Math.cos((v * Math.PI) / 180);
  const y = r * Math.sin((v * Math.PI) / 180);
  return {
    distance_au: r,
    x_au: x,
    y_au: y,
    z_au: 0,
    true_anomaly_deg: v,
    mean_anomaly_deg: ((M % 360) + 360) % 360,
  };
}

function solveKeplersEquation(M, e, tolerance = 1e-6) {
  let E = M;
  let delta = 1;
  let iterations = 0;
  while (Math.abs(delta) > tolerance && iterations < 100) {
    delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    iterations += 1;
  }
  return E;
}

module.exports = {
  getJulianDayNumber,
  calculatePlanetPosition,
  solveKeplersEquation,
};
