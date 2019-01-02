import React, { Component } from 'react';
import './App.css';
/* global google */

// Done:
// Move map and places refreshes based on new center

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
      map: {}
    }

    this.initMap = this.initMap.bind(this)
    this.getCurrentLocation = this.getCurrentLocation.bind(this)
    this.refreshNearbyPlaces = this.refreshNearbyPlaces.bind(this)
    this.centerChanged = this.centerChanged.bind(this)
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
      .then(() => map.addListener('center_changed', this.centerChanged ))
      .then(() => this.refreshNearbyPlaces() )
      .then((placesNamesAndRatingsArray) => {
        console.log('returned from refreshNearbyPlaces():' + placesNamesAndRatingsArray)
        this.placesElement.innerHTML = placesNamesAndRatingsArray.map(placesArray => placesArray.map(place => `<br>${place.name}: ${place.rating}`).join('')) // .join('') removes trailing comma
      })
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

  async refreshNearbyPlaces() {
    const centerPoint = this.state.center
    const cafeRequest = {
      location: centerPoint,
      radius: '1000',
      type: ['cafe']
    }

    const kidsActivityRequest = {
      location: centerPoint,
      radius: '1000',
      type: ['park']
    }
    
    const service = new google.maps.places.PlacesService(this.state.map)

    const cafeList = this.getPlacesList(service, cafeRequest)
    const kidsActivityList = this.getPlacesList(service, kidsActivityRequest)

    const placesArray = [await cafeList, await kidsActivityList]
    //console.log(placesArray)

    return new Promise((resolve) => {
      resolve(placesArray) 
    })  
  }

  getPlacesList(service, request) {
    return new Promise((resolve, reject) => {
      return Promise.resolve(service.nearbySearch(request, (placesArray, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log('Places Service status: ok')
          resolve(placesArray)
        }
      }))
    })
  }

  centerChanged() {
    this.setState({ center: this.state.map.getCenter() })
    this.refreshNearbyPlaces()
      .then((placesNamesAndRatings) => { 
        this.placesElement.innerHTML = (placesNamesAndRatings.map(place => `<br>${place.name}: ${place.rating}`)).join('') // .join('') removes trailing comma
      })
  }

  render() {
    return (
      <div>
        <div ref={mapElement => (this.mapElement = mapElement) } style={{ height: '500px', width: '100%' }}/>
        <div ref={placesElement => (this.placesElement = placesElement)} style={{ height: '500px', width: '100%' }}/>
      </div>
    )
  }
}

export default App
