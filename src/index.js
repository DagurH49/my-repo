import { el, empty } from './lib/elements.js';
import { weatherSearch } from './lib/weather.js';

/**
 * @typedef {Object} SearchLocation
 * @property {string} title
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 * @type {Array<SearchLocation>}
 */
const locations = [
  {
    title: 'Reykjavík',
    lat: 64.1355,
    lng: -21.8954,
  },
  {
    title: 'Akureyri',
    lat: 65.6835,
    lng: -18.0878,
  },
  {
    title: 'New York',
    lat: 40.7128,
    lng: -74.006,
  },
  {
    title: 'Tokyo',
    lat: 35.6764,
    lng: 139.65,
  },
  {
    title: 'Sydney',
    lat: -33.8688,
    lng: 151.2093,
  },
];

/**
 * Hreinsar fyrri niðurstöður, passar að niðurstöður séu birtar og birtir element.
 * @param {Element} element
 */
function renderIntoResultsContent(element) {
  const outputElement = document.querySelector('.output');

  if (!outputElement) {
    console.warn('fann ekki .output');
    return;
  }

  empty(outputElement);

  outputElement.appendChild(element);
}

/**
 * Birtir niðurstöður í viðmóti.
 * @param {SearchLocation} location
 * @param {Array<import('./lib/weather.js').Forecast>} results
 */
function renderResults(location, results) {
  const header = el(
    'tr',
    {},
    el('th', {}, 'Tími'),
    el('th', {}, 'Hiti'),
    el('th', {}, 'Ákveðinn hiti'),
    el('th', {}, 'Úrkoma'),
  );

  const body = results.map(result => el(
    'tr',
    {},
    el('td', {}, result.time.split('T')[1].slice(0, 5)), // Birta aðeins klukkustund og mínútur
    el('td', {}, result.temperature.toString()),
    el('td', {}, result.apparentTemperature.toString()),
    el('td', {}, result.precipitation.toString()),
  ));

  const resultsTable = el('table', { class: 'forecast' }, header, ...body);

  renderIntoResultsContent(
    el(
      'section',
      {},
      el('h2', {}, `Leitarniðurstöður fyrir: ${location.title}`),
      resultsTable,
    ),
  );
}

/**
 * Birta villu í viðmóti.
 * @param {Error} error
 */
function renderError(error) {
  console.log(error);
  const message = error.message;
  renderIntoResultsContent(el('p', {}, `Villa: ${message}`));
}

/**
 * Birta biðstöðu í viðmóti.
 */
function renderLoading() {
  renderIntoResultsContent(el('p', {}, 'Leita...'));
}

/**
 * Framkvæmir leit að veðri fyrir gefna staðsetningu.
 * Birtir biðstöðu, villu eða niðurstöður í viðmóti.
 * @param {SearchLocation} location Staðsetning sem á að leita eftir.
 */
async function onSearch(location) {
  renderLoading();

  let results;
  try {
    results = await weatherSearch(location.lat, location.lng);
  } catch (error) {
    renderError(error);
    return;
  }

  renderResults(location, results ?? []);
}

/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */
async function onSearchMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      renderLoading();
      try {
        const results = await weatherSearch(latitude, longitude);
        renderResults({ title: 'Núverandi staðsetning', lat: latitude, lng: longitude }, results);
      } catch (error) {
        renderError(error);
      }
    }, showError);
  } else {
    alert('Vafrinn þinn styður ekki staðsetningu.');
  }
}

/**
 * Býr til takka fyrir staðsetningu.
 * @param {string} locationTitle
 * @param {() => void} onSearch
 * @returns {HTMLElement}
 */
function renderLocationButton(locationTitle, onSearch) {
  const locationElement = el(
    'li',
    { class: 'locations__location' },
    el(
      'button',
      { class: 'locations__button', click: onSearch },
      locationTitle,
    ),
  );

  return locationElement;
}

/**
 * Býr til grunnviðmót: haus og lýsingu, lista af staðsetningum og niðurstöður (falið í byrjun).
 * @param {Element} container HTML element sem inniheldur allt.
 * @param {Array<SearchLocation>} locations Staðsetningar sem hægt er að fá veður fyrir.
 * @param {(location: SearchLocation) => void} onSearch
 * @param {() => void} onSearchMyLocation
 */
function render(container, locations, onSearch, onSearchMyLocation) {
  const parentElement = el('main', { class: 'weather' },
    el('header', {},
      el('h1', {}, 'Veðurspá')
    ),
    el('p', {}, 'Veldu stað til að sjá hita- og úrkomuspá.'),
    el('div', { class: 'locations' },
      el('ul', { class: 'locations__list' },
        renderLocationButton('Núverandi staðsetning', onSearchMyLocation),
        ...locations.map(location => renderLocationButton(location.title, () => onSearch(location)))
      )
    ),
    el('div', { class: 'output' })
  );

  container.appendChild(parentElement);
}

/**
 * Sýnir villu ef staðsetning er ekki tiltæk.
 * @param {PositionError} error
 */
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert('Notandi hafnaði beiðni um staðsetningu.');
      break;
    case error.POSITION_UNAVAILABLE:
      alert('Staðsetningarupplýsingar eru ekki tiltækar.');
      break;
    case error.TIMEOUT:
      alert('Beiðni um staðsetningu rann út.');
      break;
    case error.UNKNOWN_ERROR:
      alert('Óþekkt villa kom upp.');
      break;
  }
}

// Þetta fall býr til grunnviðmót og setur það í `document.body`
render(document.body, locations, onSearch, onSearchMyLocation);