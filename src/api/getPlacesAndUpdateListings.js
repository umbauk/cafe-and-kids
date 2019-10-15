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
  const todaysDate = new Date();

  let utcOffset = await getUTCOffsetForLocation(mapCenter);

  let eventDayWeatherForecast = getEventDayWeatherForecast(
    eventDate,
    weatherJSON,
    utcOffset,
    todaysDate,
  );

  const activityShouldBeIndoors = checkIfRainingOrTooCold(eventDayWeatherForecast);

  const filteredPlacesArray = await refreshNearbyPlaces(
    map,
    mapCenter,
    searchRadius,
    activityShouldBeIndoors,
    travelMethod,
  );

  [placeAndLabelsArray, markerArray] = addMarkersToMap(filteredPlacesArray, map);
  let placeLabelsAndUrlArray = await getPlaceUrl(placeAndLabelsArray);
  // if weather is too bad to be outdoors returns why, else returns false

  return [placeLabelsAndUrlArray, markerArray, activityShouldBeIndoors];
}
