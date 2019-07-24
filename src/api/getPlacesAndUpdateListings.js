import { getPlaceUrl } from './getPlaceUrl.js';
import {
  getEventDayWeatherForecast,
  getUTCOffsetForLocation,
  checkIfRainingOrTooCold,
} from './getEventDayWeatherForecast';
import { addMarkersToMap } from './addMarkersToMap.js';
import { refreshNearbyPlaces } from './refreshNearbyPlaces.js';

export async function getPlacesAndUpdateListings(
  map, // Google Map object
  mapCenter, // lat, lng object
  searchRadius,
  eventDate,
  weatherJSON, // weatherForecast object from OpenWeatherMap API
  travelMethod, // string of 'walk', 'cycle', 'car', 'public transport'
) {
  let placeAndLabelsArray, markerArray;
  console.log('2) getPlacesAndUpdateListings starting...');

  let utcOffset = await getUTCOffsetForLocation(mapCenter);
  console.log(`utcOffset: ${utcOffset}`);
  const todaysDate = new Date();
  let eventDayWeatherForecast = getEventDayWeatherForecast(
    eventDate,
    weatherJSON,
    utcOffset,
    todaysDate,
  );

  // if weather is too bad to be outdoors returns why, else returns false
  const activityShouldBeIndoors = checkIfRainingOrTooCold(
    eventDayWeatherForecast,
  );

  const filteredPlacesArray = await refreshNearbyPlaces(
    map,
    mapCenter,
    searchRadius,
    activityShouldBeIndoors,
    travelMethod,
  );
  [placeAndLabelsArray, markerArray] = addMarkersToMap(
    filteredPlacesArray,
    map,
  );
  console.log('3) placeLabelsArray: ...');
  let placeLabelsAndUrlArray = await getPlaceUrl(placeAndLabelsArray);

  console.log('5) refreshPlacesAndUpdateListings finished');
  return [placeLabelsAndUrlArray, markerArray, activityShouldBeIndoors];
}
