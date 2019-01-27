import React, { Component } from 'react'
import './App.css'
import { getPlacesAndUpdateListings } from './api/getPlacesAndUpdateListings'
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
        map.addListener('dragend', getPlacesAndUpdateListings(this.state.map, this.state.center) )
      })
      .then( () => {
        this.setState({ 
          center: { 
            lat: this.state.map.getCenter().lat(),
            lng: this.state.map.getCenter().lng()  
          },
          markers: [],
        })
        
        // clear markers
        this.state.markers.forEach( marker => {
          marker.setMap(null)
        })
        
        getPlacesAndUpdateListings(this.state.map, this.state.center) } )
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
          console.log('1) getCurrentLocation() complete')
          resolve(currentCoordinates)
        }))
      }
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
