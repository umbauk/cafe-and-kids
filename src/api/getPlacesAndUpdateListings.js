import { getPlaceUrl } from './getPlaceUrl.js';
/* global google */
const globalCafeQuery = 'kid friendly coffee shop'; // Google Maps text query for cafes

export async function getPlacesAndUpdateListings(
  map,
  mapCenter,
  searchRadius,
  eventDate,
  weatherJSON,
  travelMethod,
) {
  let placeAndLabelsArray, markerArray;
  console.log('2) getPlacesAndUpdateListings starting...');

  let eventDayWeatherForecast = getEventDayWeatherForecast(
    eventDate,
    weatherJSON,
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
  [placeAndLabelsArray, markerArray] = addMarkers(filteredPlacesArray, map);
  console.log('3) placeLabelsArray: ...');
  let placeLabelsAndUrlArray = await getPlaceUrl(placeAndLabelsArray, map);

  console.log('5) refreshPlacesAndUpdateListings finished');
  return [placeLabelsAndUrlArray, markerArray, activityShouldBeIndoors];
}

class MapSearchRequest {
  constructor(query, location, radius, placeType) {
    this.query = query;
    this.location = location;
    this.radius = radius;
    this.placeType = placeType;
  }
}

function getEventDayWeatherForecast(eventDate, weatherJSON) {
  const today = new Date();
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  let eventDayForecast;

  // Forecasts are every 3 hours in UNIX UTC datetime. Get the forecasts that are for the day the user selected
  if (eventDate === 'today') {
    eventDayForecast = weatherJSON.list.filter(
      forecast =>
        new Date(forecast.dt * 1000).toDateString() === today.toDateString() &&
        new Date(forecast.dt * 1000).getHours() >= 9 &&
        new Date(forecast.dt * 1000).getHours() <= 18,
    );
  } else if (eventDate === 'tomorrow') {
    eventDayForecast = weatherJSON.list.filter(
      forecast =>
        new Date(forecast.dt * 1000).toDateString() ===
          tomorrow.toDateString() &&
        new Date(forecast.dt * 1000).getHours() >= 9 &&
        new Date(forecast.dt * 1000).getHours() <= 18,
    );
  }

  return eventDayForecast;
}

function checkIfRainingOrTooCold(eventDayForecast) {
  const lowestTempForOutdoorActivity = 278; // kelvins = 5 degress celsius
  const highestTempForOutdoorActivity = 303; // kelvins = 30 degress celsius
  const maxRainInThreeHoursForOutdoorActivity = 7.5; // mm

  for (let i = 0; i < eventDayForecast.length; i++) {
    // forecasts don't have rain elements if there is 0 rain forecast
    if (eventDayForecast[i].rain) {
      if (
        eventDayForecast[i].rain['3h'] > maxRainInThreeHoursForOutdoorActivity
      ) {
        return 'too rainy';
      }
    }
    if (eventDayForecast[i].main.temp > highestTempForOutdoorActivity) {
      return 'too hot';
    } else if (eventDayForecast[i].main.temp < lowestTempForOutdoorActivity) {
      return 'too cold';
    }
  }
  return false;
}

async function refreshNearbyPlaces(
  map,
  mapCenter,
  searchRadius,
  activityShouldBeIndoors,
  travelMethod,
) {
  const centerPoint = mapCenter;
  let kidsActivityQuery = activityShouldBeIndoors
    ? 'indoor play center'
    : 'playground';
  const kidsActivityRequest = new MapSearchRequest(
    kidsActivityQuery,
    centerPoint,
    searchRadius,
    //type: ['park'],
    'kids activity',
  );

  const service = new google.maps.places.PlacesService(map);
  let kidsActivityList = getPlacesList(service, kidsActivityRequest);
  const kidsActivityPlaceArray = await kidsActivityList;
  const highRatedKidsPlacesArray = filterOutLowRatedPlaces(
    kidsActivityPlaceArray,
  );
  const withinRadiusKidsPlacesArray = checkPlaceIsWithinRadius(
    centerPoint,
    searchRadius,
    highRatedKidsPlacesArray,
  );
  const sortedKidsPlacesArray = sortByRating(withinRadiusKidsPlacesArray);
  const limitedKidsPlacesArray = limitNumberOfPlaces(sortedKidsPlacesArray, 5);

  return getCafesArray(limitedKidsPlacesArray, service, travelMethod).then(
    limitedCafePlacesArray => {
      const flattenedPlacesArray = limitedKidsPlacesArray.concat(
        ...limitedCafePlacesArray,
      );
      return Promise.resolve(flattenedPlacesArray);
    },
  );
}

async function getCafesArray(limitedKidsPlacesArray, service, travelMethod) {
  // shorten distance from activity to cafe if travelmethod is 'walk'
  const searchRadiusInMeters = travelMethod === 'walk' ? '500' : '1000';
  let promiseArray = limitedKidsPlacesArray.map(kidsPlace => {
    const cafeRequest = new MapSearchRequest(
      globalCafeQuery,
      kidsPlace.geometry.location,
      searchRadiusInMeters,
      'cafe',
    );
    return new Promise(async (resolve, reject) => {
      let cafeList = await getPlacesList(service, cafeRequest);
      const highRatedCafesArray = filterOutLowRatedPlaces(cafeList);
      const withinRadiusCafesArray = checkPlaceIsWithinRadius(
        {
          lat: kidsPlace.geometry.location.lat(),
          lng: kidsPlace.geometry.location.lng(),
        },
        searchRadiusInMeters,
        highRatedCafesArray,
      );
      const sortedCafesArray = sortByRating(withinRadiusCafesArray);
      const topRatedCafe = limitNumberOfPlaces(sortedCafesArray, 1);
      resolve(topRatedCafe);
    });
  });
  return Promise.all(promiseArray).then(limitedCafePlacesArray => {
    return Promise.resolve(limitedCafePlacesArray);
  });
}

function getPlacesList(service, request) {
  return new Promise((resolve, reject) => {
    service.textSearch(request, (placesArray, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log('Places Service status: ok');
        // Add the placeType ('cafe' or 'kids activity') to each entry in array
        let returnArray = placesArray.map(element => {
          return Object.assign(element, { placeType: request.placeType });
        });
        resolve(returnArray);
      } else {
        console.log(google.maps.places.PlacesServiceStatus);
        resolve(google.maps.places.PlacesServiceStatus);
      }
    });
  });
}

function filterOutLowRatedPlaces(flattenedPlacesArray) {
  const lowestRating = 4.0;
  return flattenedPlacesArray.filter(place => place.rating >= lowestRating);
}

function checkPlaceIsWithinRadius(
  centerPoint,
  searchRadius,
  highRatedKidsPlacesArray,
) {
  // Converts radius in metres to distance in lat/lng
  const searchRadiusInLatDegrees = parseInt(searchRadius) / 1000 / 110.574;
  const searchRadiusInLngDegrees =
    parseInt(searchRadius) /
    1000 /
    (Math.cos((centerPoint.lat * Math.PI) / 180) * 111.32);

  return highRatedKidsPlacesArray.filter(place => {
    return (
      place.geometry.location.lat() <
        centerPoint.lat + searchRadiusInLatDegrees &&
      place.geometry.location.lat() >
        centerPoint.lat - searchRadiusInLatDegrees &&
      place.geometry.location.lng() <
        centerPoint.lng + searchRadiusInLngDegrees &&
      place.geometry.location.lng() > centerPoint.lng - searchRadiusInLngDegrees
    );
  });
}

function sortByRating(filteredPlacesArray) {
  return filteredPlacesArray.sort((a, b) => b.rating - a.rating);
}

function limitNumberOfPlaces(sortedKidsPlacesArray, limit) {
  // Limits number of results per type to 'limit'
  return sortedKidsPlacesArray
    .filter(place => place.placeType === 'cafe')
    .slice(0, limit)
    .concat(
      sortedKidsPlacesArray
        .filter(place => place.placeType === 'kids activity')
        .slice(0, limit),
    );
}

function addMarkers(filteredPlacesArray, map) {
  let greenIconURL1 =
    'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=';
  let redIconURL1 =
    'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-b.png&text=';
  let iconURL2 =
    '&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1';
  const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let letterLabelIndex = 0;
  let numberLabel = 1;
  let label = '';
  let iconURL1 = '';
  let markerArray = [];

  let returnArray = filteredPlacesArray.map(element => {
    if (element.placeType === 'cafe') {
      label = letterLabels[letterLabelIndex++ % letterLabels.length];
      iconURL1 = redIconURL1;
    } else {
      label = numberLabel++;
      iconURL1 = greenIconURL1;
    }

    let marker = new google.maps.Marker({
      position: element.geometry.location,
      map: map,
      icon: iconURL1 + label + iconURL2,
    });
    markerArray.push(marker);

    return Object.assign(element, { label: label });
  });
  return [returnArray, markerArray];
}
