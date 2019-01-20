bounds: {
  north: centerPoint.lat + this.latDegreesPerKm(),
  east: centerPoint.lng - this.lngDegreesPerKm(centerPoint.lat),
  south: centerPoint.lat - this.latDegreesPerKm(),
  west: centerPoint.lng + this.lngDegreesPerKm(centerPoint.lat),
},

lngDegreesPerKm(lat) {
  // 1 degree of longitude = cos(latitude) * km length of degree at equator
  return 1 / ( Math.cos(lat) * 111.32 )
}

latDegreesPerKm() {
  // 1 degree of latitude = 111km
  return 1 / 111
}

    /*placesArray.forEach( (element) => {
      //console.log(`${element.geometry.location.lat() < centerPoint.lat + searchRadiusInLatDegrees}`)
      //console.log(`${element.geometry.location.lat() > centerPoint.lat - searchRadiusInLatDegrees}`)
      console.log(`${element.geometry.location.lng()} < ${(centerPoint.lng + searchRadiusInLngDegrees)}`)
      console.log(`${element.geometry.location.lng()} > ${(centerPoint.lng - searchRadiusInLngDegrees)}`)
    })*/

    placesNamesAndRatingsArray[0].forEach( (place) => {
      let currentLetterLabel = letterLabels[letterLabelIndex++ % letterLabels.length]
      this.addMarker(place.geometry.location, currentLetterLabel, ) //"http://maps.google.com/mapfiles/ms/icons/red.png")
      this.getPlaceUrl(place.place_id)
        .then( (placeUrl) => {
          htmlString.push(`<br>${currentLetterLabel}: <a href="${placeUrl}">${place.name}</a> - ${place.rating}`)
        })
    })

    /*
    let tempArray = placesNamesAndRatingsArray[0].map( (place) => {
      let currentLetterLabel = letterLabels[letterLabelIndex++ % letterLabels.length]
      this.addMarker(place.geometry.location, currentLetterLabel, "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=", "&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1") //"http://maps.google.com/mapfiles/ms/icons/red.png")
      this.getPlaceUrl(place.place_id)
        .then( (placeUrl) => {
          console.log(`placeUrl in refreshPlacesAndUpdateListings: ${placeUrl}`)
          return `<br>${currentLetterLabel}: <a href="${placeUrl}">${place.name}</a> - ${place.rating}`
        })

      //return htmlString
    })//.join('') // removes trailing comma*/