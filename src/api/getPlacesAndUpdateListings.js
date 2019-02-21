import { getPlaceUrl } from './getPlaceUrl.js';
/* global google */
const globalCafeQuery = 'kid friendly coffee shop'; // Google Maps text query for cafes
const globalKidsActivityQuery = 'playground'; // Google Maps text query for kids activities

export async function getPlacesAndUpdateListings(
  map,
  mapCenter,
  searchRadius,
  eventDate,
  weatherJSON,
) {
  let placeAndLabelsArray, markerArray;
  console.log('2) getPlacesAndUpdateListings starting...');

  let indoorOrOutdoorActivity = shouldActivityBeIndoorOrOutdoor(
    eventDate,
    weatherJSON,
  );
  const filteredPlacesArray = await refreshNearbyPlaces(
    map,
    mapCenter,
    searchRadius,
  );
  [placeAndLabelsArray, markerArray] = addMarkers(filteredPlacesArray, map);
  console.log('3) placeLabelsArray: ...');
  let placeLabelsAndUrlArray = await getPlaceUrl(placeAndLabelsArray, map);

  console.log('5) refreshPlacesAndUpdateListings finished');
  return [placeLabelsAndUrlArray, markerArray];
}

class MapSearchRequest {
  constructor(query, location, radius, placeType) {
    this.query = query;
    this.location = location;
    this.radius = radius;
    this.placeType = placeType;
  }
}

function shouldActivityBeIndoorOrOutdoor(eventDate, weatherJSON) {
  // parse weatherJSON to get weather today and tomorrow
  // need to receive date of activity into this function
  console.log(weatherJSON);

  // if eventDate = 'today' get all list items with same date as today and time between 9am and 6pm
  // check them each for rain and if temp below 5 degrees C
  // else get all list items for tomorrow and time between 9am and 6pm
  // check them each for rain and if temp below 5 degrees C
  const todaysDate = new Date();
  if (eventDate === 'today') {
    weatherJSON.list.filter(forecast => {
      forecast.dt = new Date(forecast.dt);
    });
  } else if (eventDate === 'tomorrow') {
  }
}

async function refreshNearbyPlaces(map, mapCenter, searchRadius) {
  const centerPoint = mapCenter;
  const kidsActivityRequest = new MapSearchRequest(
    globalKidsActivityQuery,
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

  return getCafesArray(limitedKidsPlacesArray, service).then(
    limitedCafePlacesArray => {
      const flattenedPlacesArray = limitedKidsPlacesArray.concat(
        ...limitedCafePlacesArray,
      );
      return Promise.resolve(flattenedPlacesArray);
    },
  );
}

async function getCafesArray(limitedKidsPlacesArray, service) {
  let promiseArray = limitedKidsPlacesArray.map(kidsPlace => {
    const searchRadiusInMeters = '1000';
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
