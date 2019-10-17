export function getPlaceUrl(placeAndLabelsArray) {
  return placeAndLabelsArray.map(place => {
    for (let property in place) {
      let placeNameWithoutSpaces = place[property].name.replace(/\s/g, '+');
      let placeUrl = `https://www.google.com/maps/search/?api=1&query=${placeNameWithoutSpaces}&query_place_id=${place[property].place_id}`;
      Object.assign(place[property], { url: placeUrl });
    }
    return place;
  });
}
