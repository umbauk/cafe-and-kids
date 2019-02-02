import React, { Component } from 'react'
import { Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Button } from 'reactstrap';
import './App.css'
import { getPlacesAndUpdateListings } from './api/getPlacesAndUpdateListings'

/* global google */

// To do:
// format places: location, snippet, (photo?)
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
//  - STRETCH: ability to decline individual recommendations, which then get replaced by another
//  - ability to click on acitivty to be taken to website or detailed Google Maps listing for it
// Redesign for mobile
// Host on server
// Produce Back-end to save user searches

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
    this.getPlaceHtmlString = this.getPlaceHtmlString.bind(this)
    this.updateListings = this.updateListings.bind(this)
  }

  componentDidMount() {
    // Connect the initMap() function within this class to the global window context,
    // so Google Maps can invoke it
    window.initMap = this.initMap;
    // Asynchronously load the Google Maps script, passing in the callback reference
    loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyBoKmshPxsNC3n5M88_BKq2I_IJgiVx47g&libraries=places&callback=initMap')
  }

  initMap() {
    const zoom = 13
    let map = {}

    this.getCurrentLocation()
      .then((userLocationCoords) => { 
        let mapConfig = {
          center: userLocationCoords,
          zoom
        } 
        map = new google.maps.Map(this.mapElement, mapConfig)
        this.setState({ 
          map: map,
          center: { 
            lat: map.getCenter().lat(),
            lng: map.getCenter().lng()  
          },
         })

      })
      .then(() => {
        map.addListener('dragend', () => this.updateListings() )
        //this.updateListings()
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
          console.log('1) getCurrentLocation() complete')
          resolve(currentCoordinates)
        }))
      }
    })
  }

  async updateListings() {
    let placeMarkersArray, placeLabelsAndUrlArray
    
    // clear markers
    this.state.markers.forEach( marker => {
      marker.setMap(null)
    })

    this.setState({ 
      center: { 
        lat: this.state.map.getCenter().lat(),
        lng: this.state.map.getCenter().lng(),
      },
      markers: [],
     })

    ;[ placeLabelsAndUrlArray, placeMarkersArray ] = await getPlacesAndUpdateListings(this.state.map, this.state.center)

    this.setState( {
      markers: [...placeMarkersArray]
    })
    this.cafeElement.innerHTML = this.getPlaceHtmlString(placeLabelsAndUrlArray.filter( element => element.placeType === 'cafe'))
    this.kidsActivityElement.innerHTML = this.getPlaceHtmlString(placeLabelsAndUrlArray.filter( element => element.placeType === 'kids activity'))
  }

  getPlaceHtmlString(placeLabelsAndUrlArray) {
    return placeLabelsAndUrlArray.map( (place) => {
      return `<br>${place.label}: <a target="_blank" rel="noopener noreferrer" href="${place.url}">${place.name}</a> - ${place.rating}`
    }).join('')
  }

  render() {
    return (
      <div id='parent-window'>
        <div id='map-element' ref={ mapElement => (this.mapElement = mapElement) }/>

        <Card className='input-card'>
          <CardBody>
            <CardTitle>Card title</CardTitle>
            <CardSubtitle>Card subtitle</CardSubtitle>
            <CardText>Some quick example text to build on the card title and make up the bulk of the card's content.</CardText>
            <Button>Button</Button>
          </CardBody>
        </Card>
        
        <div id='cafes' className='place-container'>
          <h2>Cafes</h2>
          <div ref={cafeElement => (this.cafeElement = cafeElement)} />
        </div>

        <div id='kids-activities' className='place-container'>
          <h2>Kids Activities</h2>
          <div ref={kidsActivityElement => (this.kidsActivityElement = kidsActivityElement)} />
        </div>
      </div>
    )
  }
}

export default App
