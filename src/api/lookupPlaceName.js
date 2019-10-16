/* global google */

export async function lookupPlaceName(map, placeToLookup, currentMapCenter) {
  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(map);
    service.textSearch(
      {
        query: placeToLookup,
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          let centerCoordsOfPlace = results[0].geometry.location;

          resolve(centerCoordsOfPlace);
        } else {
          // place not found, return 'UNKNOWN'
          console.log(status);
          let centerCoordsOfPlace = 'UNKNOWN';
          resolve(centerCoordsOfPlace);
        }
      },
    );
  });
}
