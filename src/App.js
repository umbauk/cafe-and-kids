import React, { Component } from 'react';
import './App.css';
/* global google */

// Done:
// Move map and places refreshes based on new center
//map over places geometry.location data to remove those outside of search radius
// remove markers and enter new markers when dragging

// To do:
// link markers and text and add new colour markers for cafes
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
      map: {},
      markers: []
    }

    this.initMap = this.initMap.bind(this)
    this.getCurrentLocation = this.getCurrentLocation.bind(this)
    this.refreshNearbyPlaces = this.refreshNearbyPlaces.bind(this)
    this.refreshPlacesAndUpdateListings = this.refreshPlacesAndUpdateListings.bind(this)
    this.addMarker = this.addMarker.bind(this)
    this.clearMarkers = this.clearMarkers.bind(this)
    this.checkPlaceIsWithinRadius = this.checkPlaceIsWithinRadius.bind(this)
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


  refreshPlacesAndUpdateListings() {
    const letterLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let letterLabelIndex = 0
    let numberLabel = 1
    
    this.setState({ 
      center: { 
        lat: this.state.map.getCenter().lat(),
        lng: this.state.map.getCenter().lng()  
      }
    })
    
    this.refreshNearbyPlaces()
    .then((placesNamesAndRatingsArray) => {
      this.clearMarkers()
      this.setState({
        markers: []
      })

      this.cafeElement.innerHTML = placesNamesAndRatingsArray[0].map( place => {
        let currentLetterLabel = letterLabels[letterLabelIndex++ % letterLabels.length]
        this.addMarker(place.geometry.location, currentLetterLabel, "http://maps.google.com/mapfiles/ms/icons/red.png")
        return `<br>${currentLetterLabel}: ${place.name} - ${place.rating}`
      }
      ).join('') // .join('') removes trailing comma

      this.kidsActivityElement.innerHTML = placesNamesAndRatingsArray[1].map( place => {
        let currentNumberLabel = numberLabel++
        this.addMarker(place.geometry.location, currentNumberLabel.toString(), "http://maps.google.com/mapfiles/ms/icons/blue.png")
        return `<br>${currentNumberLabel}: ${place.name} - ${place.rating}`
      }
      ).join('') // .join('') removes trailing comma
    })
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


  addMarker(placeLocation, label, icon) {
    let marker = new google.maps.Marker({
      position: placeLocation,
      map: this.state.map,
      label: label,
      icon: icon,
    })
    this.setState( prevState => ({
      markers: [...prevState.markers, marker]
    }))
  }

  clearMarkers() {
    this.state.markers.forEach( marker => {
      marker.setMap(null)
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
