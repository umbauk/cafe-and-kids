export function getPlaceUrl(placeAndLabelsArray) {
  return placeAndLabelsArray.map(place => {
    let placeNameWithoutSpaces = place.name.replace(/\s/g, '+');
    let placeUrl = `https://www.google.com/maps/search/?api=1&query=${placeNameWithoutSpaces}&query_place_id=${place.place_id}`;
    return Object.assign(place, { url: placeUrl });
  });
}
