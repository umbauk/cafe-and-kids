import React, { Component } from 'react';
import './App.css';
/* global google */

// To do:
// format places: Name, location, snippet, rating (photo?), hyperlink
// add search text box to search for place to act as new center
// return highly-rated, kid friendly cafes and show markers on map
// return highly-rated playgrounds / playcentres / parks for kids and show markers on map
// Add user-journey: 
//  - enter ages of children
//  - enter date/time (check weather)
//  - how close should it be (based on driving time at the date/time specified, walking time) OR where should it be
//  - suggest indoor/outdoor but give option to change
//  - list of highest rated (create method for this), open, relevant activities shown, pref with snippet/photo to explain what it is
//  - include numbered markers on map
//  - include coffee, lunch and dinner recommendations as appropriate
//  - ability to decline individual recommendations, which then get replaced by another
//  - ability to click on acitivty to be taken to website or detailed Google Maps listing for it
// Redesign for mobile


function loadJS(src) {
  var ref = window.document.getElementsByTagName("script")[0];
  var script = window.document.createElement("script");
  script.src = src;
  script.async = true;
  ref.parentNode.insertBefore(script, ref);
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      center: {
        lat: 37.774929,
        lng: -122.419416
      },
      map: {},
      markers: []
    }

    this.initMap = this.initMap.bind(this)
    this.getCurrentLocation = this.getCurrentLocation.bind(this)
    this.refreshNearbyPlaces = this.refreshNearbyPlaces.bind(this)
    this.refreshPlacesAndUpdateListings = this.refreshPlacesAndUpdateListings.bind(this)
    this.addMarkers = this.addMarkers.bind(this)
    this.clearMarkers = this.clearMarkers.bind(this)
    this.checkPlaceIsWithinRadius = this.checkPlaceIsWithinRadius.bind(this)
    this.getPlaceUrl = this.getPlaceUrl.bind(this)
  }


  componentDidMount() {
    // Connect the initMap() function within this class to the global window context,
    // so Google Maps can invoke it
    window.initMap = this.initMap;
    // Asynchronously load the Google Maps script, passing in the callback reference
    loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyBoKmshPxsNC3n5M88_BKq2I_IJgiVx47g&libraries=places&callback=initMap')
  }


  initMap() {
    const zoom = 14
    let map = {}

    this.getCurrentLocation()
      .then((userCoords) => { 
        let mapConfig = {
          center: userCoords,
          zoom
        } 
        map = new google.maps.Map(this.mapElement, mapConfig)
        this.setState({ map: map })

      })
      .then(() => {
        map.addListener('dragend', this.refreshPlacesAndUpdateListings )
      })
      .then( this.refreshPlacesAndUpdateListings )
      .catch((error) => { console.log(error) })
  }


  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error('Get User Location error'))
      else {
        return Promise.resolve(navigator.geolocation.getCurrentPosition((position) => {
          let currentCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          this.setState({ center: currentCoordinates })
          resolve(currentCoordinates)
        }))
      }
    })
  }


  async refreshPlacesAndUpdateListings() {
    
    this.setState({ 
      center: { 
        lat: this.state.map.getCenter().lat(),
        lng: this.state.map.getCenter().lng()  
      }
    })
    
    let placesNamesAndRatingsArray = await this.refreshNearbyPlaces()
    this.clearMarkers()
    this.setState({ markers: [] })
    let placeLabelsArray = this.addMarkers(placesNamesAndRatingsArray)
    console.log(placeLabelsArray)
    let placeUrlArray = await this.getPlaceUrl(placesNamesAndRatingsArray)
    console.log(`placeUrlArray: ${placeUrlArray}`)
    this.cafeElement.innerHTML = placesNamesAndRatingsArray[0].map( (place, index) => {
      return `<br>${placeLabelsArray[index]}: <a href="${placeUrlArray[index]}">${place.name}</a> - ${place.rating}`
    })
    

     /* this.kidsActivityElement.innerHTML = placesNamesAndRatingsArray[1].map( async (place) => {
        let currentNumberLabel = numberLabel++
        this.addMarker(place.geometry.location, currentNumberLabel.toString(), "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-b.png&text=", "&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1")
        placeUrl = await this.getPlaceUrl(place.place_id) 
        //console.log(`placeUrl in refreshPlacesAndUpdateListings: ${placeUrl}`)
        return `<br>${currentNumberLabel}: <a href="${placeUrl}">${place.name}</a> - ${place.rating}`
      }
      ).join('') // .join('') removes trailing comma*/
    
  }


  async refreshNearbyPlaces() {
    const centerPoint = this.state.center
    const searchRadius = '2000'
    const cafeRequest = {
      query: 'kid friendly coffee shop',
      location: centerPoint,
      radius: searchRadius,
      //type: ['cafe'],
    }

    const kidsActivityRequest = {
      query: 'playground',
      location: centerPoint,
      radius: searchRadius,
      //type: ['park'],
    }
    
    const service = new google.maps.places.PlacesService(this.state.map)

    let cafeList = this.getPlacesList(service, cafeRequest)
    let kidsActivityList = this.getPlacesList(service, kidsActivityRequest)

    const placesArray = [await cafeList, await kidsActivityList]
    const filteredPlacesArray = this.checkPlaceIsWithinRadius(centerPoint, searchRadius, placesArray)

    return new Promise((resolve) => {
      resolve(filteredPlacesArray) 
    })  
  }


  getPlacesList(service, request) {
    return new Promise((resolve, reject) => {
      return Promise.resolve(service.textSearch(request, (placesArray, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log('Places Service status: ok')
          resolve(placesArray)
        } else {
          console.log(google.maps.places.PlacesServiceStatus)
        }
      }))
    })
  }

  checkPlaceIsWithinRadius(centerPoint, searchRadius, placesArray) {
    let filteredArray = []
    const searchRadiusInLatDegrees = (parseInt(searchRadius) / 1000) / 111
    const searchRadiusInLngDegrees = (parseInt(searchRadius) / 1000) / ( Math.cos(centerPoint.lat) * 111.32 )

    placesArray.forEach( element => {
      filteredArray.push(
        element.filter( place => {
          return (place.geometry.location.lat() < (centerPoint.lat + searchRadiusInLatDegrees)) &&
            (place.geometry.location.lat() > (centerPoint.lat - searchRadiusInLatDegrees)) &&
            (place.geometry.location.lng() > (centerPoint.lng + searchRadiusInLngDegrees)) &&
            (place.geometry.location.lng() < (centerPoint.lng - searchRadiusInLngDegrees))
        })
      )
    })
    return filteredArray
  }


  addMarkers(placeLocationArray) {
    let iconURL1 = "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=" 
    let iconURL2 = "&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1"
    const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let letterLabelIndex = 0
    let numberLabel = 0
    let labelIsLetter = true
    let label = ''
    let usedLabels = []

    placeLocationArray.forEach( (array) => {
      array.forEach( (element) => {
        if(labelIsLetter) {
          label = letterLabels[letterLabelIndex++ % letterLabels.length]
        } else {
          label = numberLabel++
        }
        usedLabels.push(label)
        
        let marker = new google.maps.Marker({
          position: element.geometry.location,
          map: this.state.map,
          icon: iconURL1 + label + iconURL2,
        })
        this.setState( prevState => ({
          markers: [...prevState.markers, marker]
        }))
        
      })
      labelIsLetter = false
    })
    return usedLabels
  }

  clearMarkers() {
    this.state.markers.forEach( marker => {
      marker.setMap(null)
    })
  }

  getPlaceUrl(cafeAndKidsActivitiesArray) {
    let placeUrlArray = []
    const service = new google.maps.places.PlacesService(this.state.map)

    return new Promise( async (resolve, reject) => {
      for (const placeArray of cafeAndKidsActivitiesArray) {
        for (const place of placeArray) { 
          await service.getDetails({ placeId: place.place_id, fields: ['url'] }, (place, status) => { 
            console.log(status)
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              console.log(place.url)
              placeUrlArray.push(place.url)
            }
          })
        }
      }
      console.log('finished')
      return Promise.resolve(placeUrlArray)
    })
  }

  render() {
    return (
      <div style={{ height: '100vh' }}>
        <div ref={mapElement => (this.mapElement = mapElement) } style={{ height: '60%', width: '100%' }}/>
        <div id='cafes' style={{ 
          height: '400px', 
          width: '50%', 
          float: 'left', 
          color: 'white', 
          backgroundColor: 'gray' 
        }}>

          <h2>Cafes</h2>
          <div ref={cafeElement => (this.cafeElement = cafeElement)} />
        </div>
        <div id='kids-activities' style={{ 
          height: '400px', 
          width: '50%', 
          float: 'left', 
          color: 'white', 
          backgroundColor: 'gray' 
        }}>

          <h2>Kids Activities</h2>
          <div ref={kidsActivityElement => (this.kidsActivityElement = kidsActivityElement)} />
        </div>
      </div>
    )
  }
}

export default App
