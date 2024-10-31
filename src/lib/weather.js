const API_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise} - Promise that resolves after the given time.
 */
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @typedef {Object} Forecast
 * @property {string} time
 * @property {number} temperature
 * @property {number} precipitation
 * @property {number} apparentTemperature
 */

/**
 * Tekur við gögnum frá Open Meteo og skilar fylki af spám í formi Forecast.
 * @param {any} data Gögn frá Open Meteo.
 * @returns {Array<Forecast>}
 */
function parseResponse(data) {
  const hourly = data.hourly;
  const { time = [], precipitation = [], temperature_2m = [], apparent_temperature = [] } = hourly;

  const allForecasts = [];
  for (let i = 0; i < time.length; i++) {
    /** @type string */
    const _time = time[i];

    /** @type number */
    const _pre = precipitation[i];

    /** @type number */
    const _temp = temperature_2m[i];

    /** @type number */
    const _apparentTemp = apparent_temperature[i];

    /** @type Forecast */
    const forecast = {
      time: _time,
      precipitation: _pre,
      temperature: _temp,
      apparentTemperature: _apparentTemp,
    };

    allForecasts.push(forecast);
  }

  return allForecasts;
}

/**
 * Sækir veðurspá fyrir gefnar hnit.
 * @param {number} latitude - Breiddargráða staðsetningar.
 * @param {number} longitude - Lengdargráða staðsetningar.
 * @returns {Promise<Array<Forecast>>} - Skilar loforði sem leysist upp í veðurspá.
 */
export async function weatherSearch(latitude, longitude) {
  await sleep(1000); // Simulate network delay

  const url = new URL(API_URL);
  const querystring = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: 'temperature_2m,apparent_temperature,precipitation',
    timezone: 'GMT',
    forecast_days: '1',
  });
  url.search = querystring.toString();

  const response = await fetch(url.href);
  if (!response.ok) {
    throw new Error('Gat ekki sótt veðurspá');
  }

  const data = await response.json();

  // Breyta gögnunum í það form sem við viljum
  const results = parseResponse(data);

  return results;
}