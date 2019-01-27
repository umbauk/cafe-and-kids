// need to fix setState in addMarkers() - possibly by returning array of markers to App.js
// need to fix setting of cafeElement and kidsActivityElement


import { getPlaceUrl } from './getPlaceUrl.js'
/* global google */

export async function getPlacesAndUpdateListings(map, mapCenter) {
  console.log('2) refreshPlacesAndUpdateListings starting...')
  
  let filteredPlacesArray = await refreshNearbyPlaces(map, mapCenter)
  let placeAndLabelsArray = addMarkers(filteredPlacesArray, map)
  console.log('3) placeLabelsArray: ...')
  let placeLabelsAndUrlArray = await getPlaceUrl(placeAndLabelsArray, map)
  await console.log('7) Writing to HTML')
  this.cafeElement.innerHTML = await getPlaceHtmlString(placeLabelsAndUrlArray.filter( element => element.placeType === 'cafe'))
  this.kidsActivityElement.innerHTML = await getPlaceHtmlString(placeLabelsAndUrlArray.filter( element => element.placeType === 'kids activity'))
  
  console.log('8) refreshPlacesAndUpdateListings finished')
}

function getPlaceHtmlString(placeLabelsAndUrlArray) {
  return Promise.resolve(
    placeLabelsAndUrlArray.map( (place, index) => {
      return `<br>${place.label}: <a target="_blank" rel="noopener noreferrer" href="${place.url}">${place.name}</a> - ${place.rating}`
    }).join('')
  )
}

async function refreshNearbyPlaces(map, mapCenter) {
  const centerPoint = mapCenter
  const searchRadius = '2000'
  const cafeRequest = {
    query: 'kid friendly coffee shop',
    location: centerPoint,
    radius: searchRadius,
    //type: ['cafe'],
    placeType: 'cafe',
  }

  const kidsActivityRequest = {
    query: 'playground',
    location: centerPoint,
    radius: searchRadius,
    //type: ['park'],
    placeType: 'kids activity'
  }
  
  const service = new google.maps.places.PlacesService(map)

  let cafeList = getPlacesList(service, cafeRequest)
  let kidsActivityList = getPlacesList(service, kidsActivityRequest)

  const placesArray = [await cafeList, await kidsActivityList]
  const flattenedPlacesArray = [].concat(...placesArray)
  const filteredPlacesArray = checkPlaceIsWithinRadius(centerPoint, searchRadius, flattenedPlacesArray)
  return new Promise((resolve) => {
    resolve(filteredPlacesArray) 
  })  
}

function getPlacesList(service, request) {
  return new Promise((resolve, reject) => {
    service.textSearch(request, (placesArray, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log('Places Service status: ok')
        // Add the placeType (cafe or 'kids activity') to each entry in array
        let returnArray = placesArray.map( element => {
          return Object.assign(element, { placeType: request.placeType })
        })
        resolve(returnArray)
      } else {
        console.log(google.maps.places.PlacesServiceStatus)
        resolve(google.maps.places.PlacesServiceStatus)
      }
    })
  })
}

function checkPlaceIsWithinRadius(centerPoint, searchRadius, placesArray) {
  const searchRadiusInLatDegrees = (parseInt(searchRadius) / 1000) / 111
  const searchRadiusInLngDegrees = (parseInt(searchRadius) / 1000) / ( Math.cos(centerPoint.lat) * 111.32 )

  return placesArray.filter( place => {
    return (place.geometry.location.lat() < (centerPoint.lat + searchRadiusInLatDegrees)) &&
      (place.geometry.location.lat() > (centerPoint.lat - searchRadiusInLatDegrees)) &&
      (place.geometry.location.lng() > (centerPoint.lng + searchRadiusInLngDegrees)) &&
      (place.geometry.location.lng() < (centerPoint.lng - searchRadiusInLngDegrees))
  })
}

function addMarkers(filteredPlacesArray, map) {
  let greenIconURL1 = "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=" 
  let redIconURL1 = "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-b.png&text=" 
  let iconURL2 = "&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1"
  const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let letterLabelIndex = 0
  let numberLabel = 1
  let label = ''
  let iconURL1

  let returnArray = filteredPlacesArray.map( (element) => {
    if(element.placeType === 'cafe') {
      label = letterLabels[letterLabelIndex++ % letterLabels.length]
      iconURL1 = redIconURL1
    } else {
      label = numberLabel++
      iconURL1 = greenIconURL1
    }
    
    let marker = new google.maps.Marker({
      position: element.geometry.location,
      map: map,
      icon: iconURL1 + label + iconURL2,
    })
    this.setState( prevState => ({
      markers: [...prevState.markers, marker]
    }))
    return Object.assign(element, { label: label })
  })

  return returnArray
}


