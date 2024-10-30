const API_URL = 'https://api.open-meteo.com/v1/forecast';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @typedef {Object} Forecast
 * @property {string} time
 * @property {number} temperature
 * @property {number} precipitation
 */

/**
 * Tekur við gögnum frá Open Meteo og skilar fylki af spám í formi Forecast.
 * @param {any} data Gögn frá Open Meteo.
 * @returns {Array<Forecast>}
 */
function parseResponse(data) {
  console.log(data);

  const hourly = data.hourly;
  const { time = [], precipitation = [], temperature_2m = [] } = hourly;

  const allForecasts = [];
  for (let i = 0; i < time.length; i++) {
    /** @type string */
    const _time = time[i];

    /** @type number */
    const _pre = precipitation[i];

    /** @type number */
    const _temp = temperature_2m[i];

    /** @type Forecast */
    const forecast = {
      time: _time,
      precipitation: _pre,
      temperature: _temp,
    };

    allForecasts.push(forecast);
  }

  return allForecasts;
}
/**
 * Sækir veðurspá fyrir gefnar hnit.
 * @param {number} latitude - Breiddargráða staðsetningar.
 * @param {number} longitude - Lengdargráða staðsetningar.
 * @returns {Promise<Array>} - Skilar loforði sem leysist upp í veðurspá.
 */
export async function weatherSearch(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,precipitation&timezone=GMT&forecast_days=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Gat ekki sótt veðurspá');
  }

  const data = await response.json();

  // Breyta gögnunum í það form sem við viljum
  const results = data.hourly.time.map((time, index) => ({
    time,
    temperature: data.hourly.temperature_2m[index],
    apparentTemperature: data.hourly.apparent_temperature[index],
    precipitation: data.hourly.precipitation[index],
  }));

  return results;
}
