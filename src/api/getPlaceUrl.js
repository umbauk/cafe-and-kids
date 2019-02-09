export function getPlaceUrl(placeAndLabelsArray, map) {
  console.log('4) getPlaceUrl starting')
  return placeAndLabelsArray.map( place => {
    let placeNameWithoutSpaces = place.name.replace(/\s/g, '+')
    let placeUrl = `https://www.google.com/maps/search/?api=1&query=${placeNameWithoutSpaces}&query_place_id=${place.place_id}`
    return Object.assign( place, { url: placeUrl })
  })
}

/* OLD GOOGLE PLACE DETAILS REQUEST
export function getPlaceUrl(placeAndLabelsArray, map) {
  console.log('4) getPlaceUrl starting')
  const service = new google.maps.places.PlacesService(map)
  let i = 0
  let promiseArray = placeAndLabelsArray.map( (place) => {
    i++
    return new Promise((resolve, reject) => { 
      // Space requests to Google Maps Places API by 250ms to avoid OVER_QUERY_LIMIT error
      setTimeout( () => {
        getUrlsFromGoogle(place, service)
        .then( (placeUrl) => {
          resolve( Object.assign( place, {url: placeUrl} ) )
        })}
      , 250 * i)
    })
  })

  return Promise.all(promiseArray).then( (resultsArray) => {
    console.log('6) getPlaceUrl complete')
    return Promise.resolve(resultsArray)
  })
}

function getUrlsFromGoogle(place, service) {
  console.log('5) getUrlsFromGoogle starting...')
  return new Promise((resolve, reject) => {
      service.getDetails({ placeId: place.place_id, fields: ['url'] }, (placeDetails, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log('Places Service status: ok')
          resolve(placeDetails.url)
        } else {
          console.log(status)
          resolve('getDetails request failed')
        }
      })
  })
}
*/