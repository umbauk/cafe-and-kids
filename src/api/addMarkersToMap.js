/* global google */

export function addMarkersToMap(filteredPlacesArray, map) {
  let greenIconURL1 =
    'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=';
  let redIconURL1 =
    'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-b.png&text=';
  let iconURL2 = '&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1';
  const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let letterLabelIndex = 0;
  let numberLabel = 1;
  let markerArray = [];

  let returnArray = filteredPlacesArray.map(element => {
    let cafeLabel = letterLabels[letterLabelIndex++ % letterLabels.length];
    let cafeIconURL1 = redIconURL1;
    let kidsPlaceLabel = numberLabel++;
    let kidsPlaceIconURL1 = greenIconURL1;

    if (typeof element.cafe.geometry !== 'undefined') {
      // If no cafe was found, don't add marker or label
      let marker = new google.maps.Marker({
        position: element.cafe.geometry.location,
        map: map,
        icon: cafeIconURL1 + cafeLabel + iconURL2,
      });
      markerArray.push(marker);
      Object.assign(element.cafe, { label: cafeLabel });
    } else {
      Object.assign(element.cafe, { label: '-' });
    }

    let marker = new google.maps.Marker({
      position: element.kidsPlace.geometry.location,
      map: map,
      icon: kidsPlaceIconURL1 + kidsPlaceLabel + iconURL2,
    });
    markerArray.push(marker);

    Object.assign(element.kidsPlace, { label: kidsPlaceLabel });
    return element;
  });
  return [returnArray, markerArray];
}
