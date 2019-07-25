import React, { Component } from 'react';
import {
  Card,
  CardText,
  CardBody,
  CardTitle,
  Button,
  Input,
  Table,
} from 'reactstrap';
//import Slider from './Slider.js';
import './App.css';
import { getPlacesAndUpdateListings } from './api/getPlacesAndUpdateListings';
import { getCurrentLocation } from './api/getCurrentLocation';
import { getWeather } from './api/getWeather';
import { lookupPlaceName } from './api/lookupPlaceName';
import Config from './config.js'; // API Keys
import loadJS from './loadJS.js'; // loads Google Maps API script

/* global google */

// Bugs:

// To do:
// Change timezone to location selected if location is outside user's curent timezone
// avoid duplicate cafes
// change text input for minutes to slider
// have box open when clicking marker with details and photo?. Also highlight relevant text in card
// Misc: incorporate number of reviews into order, say if no results so know it's working, format tables so columns are aligned
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

const CardTable = ({ cardId, cardText, tableId, placeResultsArray }) => (
  <Card id={cardId}>
    <CardBody>
      <CardText>{cardText}</CardText>
      {placeResultsArray && (
        <ResultsTable id={tableId} placeResultsArray={placeResultsArray} />
      )}
    </CardBody>
  </Card>
);

const ResultsTable = ({ placeResultsArray }) => (
  <Table borderless>
    <thead>
      <tr>
        <th>Label</th>
        <th>Place name</th>
        <th>Rating / 5</th>
      </tr>
    </thead>
    <tbody>
      {placeResultsArray.map(place => (
        <tr key={place.label}>
          <th scope="row">{place.label}</th>
          <td>
            <a target="_blank" rel="noopener noreferrer" href={place.url}>
              {place.name}
            </a>
          </td>
          <td>{place.rating}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      center: {
        lat: 53.345806,
        lng: -6.259674,
      },
      map: {},
      markers: [],
      eventDate: null, // Date user wants to do activity
      cafeResults: '', // HTML to be displayed in Table
      kidsActivityResults: '', // HTML to be displayed in Table
      location: null,
      locationTextBoxValue: '',
      locationCoords: null,
      proximityMinutes: '',
      travelMethod: null,
      searchRadius: null,
      activityShouldbeIndoors: null,
      travelMinutes: 20,
    };

    this.initMap = this.initMap.bind(this);
    this.updateListings = this.updateListings.bind(this);
  }

  componentDidMount() {
    // Connect the initMap() function within this class to the global window context,
    // so Google Maps can invoke it
    window.initMap = this.initMap;
    // Asynchronously load the Google Maps script, passing in the callback reference
    const KEY = Config.passwords.GOOGLE_API_KEY;
    loadJS(
      `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&callback=initMap`,
    );
  }

  initMap() {
    const zoom = 3; // 13
    let map = {};

    let mapConfig = {
      center: {
        lat: 53.345806,
        lng: -6.259674,
      },
      zoom,
    };
    map = new google.maps.Map(this.mapElement, mapConfig);
    map.addListener('dragend', () => this.updateListings());

    this.setState({
      map: map,
      center: {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng(),
      },
    });
  }

  async updateListings(searchRadius) {
    try {
      let placeMarkersArray, placeLabelsAndUrlArray, activityShouldbeIndoors;

      // clear markers
      this.state.markers.forEach(marker => {
        marker.setMap(null);
      });

      this.setState({
        center: {
          lat: this.state.map.getCenter().lat(),
          lng: this.state.map.getCenter().lng(),
        },
        markers: [],
      });

      const weatherJSON = await getWeather(this.state.map.getCenter());

      [
        placeLabelsAndUrlArray,
        placeMarkersArray,
        activityShouldbeIndoors,
      ] = await getPlacesAndUpdateListings(
        this.state.map,
        {
          lat: this.state.map.getCenter().lat(),
          lng: this.state.map.getCenter().lng(),
        },
        this.state.searchRadius || searchRadius,
        this.state.eventDate,
        weatherJSON,
        this.state.travelMethod,
      );

      this.setState({
        markers: [...placeMarkersArray],
        cafeResults: placeLabelsAndUrlArray.filter(
          element => element.placeType === 'cafe',
        ),
        kidsActivityResults: placeLabelsAndUrlArray.filter(
          element => element.placeType === 'kids activity',
        ),
        activityShouldbeIndoors: activityShouldbeIndoors,
      });
    } catch (error) {
      console.error(error);
    }
  }

  dateBtnClicked = evt => {
    this.setState({
      eventDate: evt.target.name,
    });
  };

  locationTextBoxChanged = evt => {
    if (!this.state.autoCompleteAddedToTextBox) {
      this.setState({
        autoCompleteAddedToTextBox: true,
      });
      const input = document.getElementById('locationTextBox');
      this.autocomplete = new google.maps.places.Autocomplete(input);
      this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
    }
    this.setState({
      locationTextBoxValue: evt.target.value,
    });
  };

  handlePlaceSelect = () => {
    // when place selected from dropdown box, add coordinates of selected place to state
    if (this.autocomplete.getPlace().geometry) {
      this.setState({
        locationCoords: this.autocomplete.getPlace().geometry.location,
      });
    }
  };

  locationBtnClicked = async evt => {
    const map = this.state.map;
    const centerCoords = await this.getCenterCoords(evt, map);

    this.setState({
      location: 1,
    });
    map.panTo(centerCoords);
    map.setCenter(centerCoords);
    map.setZoom(13);
  };

  getCenterCoords = (evt, map) => {
    return new Promise(async (resolve, reject) => {
      //let centerCoords;
      if (evt.target.name === 'useCurrentLocation') {
        resolve(await getCurrentLocation());
      } else if (!this.state.locationCoords) {
        // if place not selected from Maps autocomplete dropdown list, user has typed in place manually
        resolve(
          await lookupPlaceName(
            map,
            this.state.locationTextBoxValue,
            this.state.center, // default value
          ),
        );
      } else {
        resolve(this.state.locationCoords);
      }
    });
  };

  proximityMinutesTextBoxChanged = evt => {
    this.setState({
      proximityMinutes: evt.target.value,
    });
  };

  proximityBtnClicked = evt => {
    if (!this.state.proximityMinutes > 0) {
      // user has not entered a number in the input field
      alert('Please enter a number');
    } else {
      this.setState({
        travelMethod: evt.target.name,
      });
      const searchRadius = this.distanceCalculation(evt.target.name);
      this.setState({
        searchRadius: searchRadius,
      });
      this.updateListings(searchRadius);
    }
  };

  distanceCalculation = travelMethod => {
    const speedOfTransportInMetresPerHr = {
      walk: 5000,
      cycle: 10000,
      car: 40000,
      publicTransport: 20000,
    };

    const searchRadius = (
      (speedOfTransportInMetresPerHr[travelMethod] *
        this.state.proximityMinutes) /
      60
    ).toString();

    return searchRadius;
  };

  handleTravelMinutesChange = value => {
    this.setState({ travelMinutes: value });
  };

  render() {
    return (
      <div id="parent-window">
        <div
          id="map-element"
          ref={mapElement => (this.mapElement = mapElement)}
        />

        <div id="cardtable-container">
          {!this.state.eventDate && (
            <Card id="welcome-card">
              <CardBody>
                <CardTitle>
                  Welcome to <b>Everyone's Happy</b> - the app for finding days
                  out for the kids AND you!
                </CardTitle>
                <CardText>
                  When would you like to do your family activity?
                </CardText>
                <Button
                  className="button"
                  onClick={this.dateBtnClicked}
                  name="today"
                >
                  Today
                </Button>
                <Button
                  className="button"
                  onClick={this.dateBtnClicked}
                  name="tomorrow"
                >
                  Tomorrow
                </Button>
              </CardBody>
            </Card>
          )}

          {this.state.eventDate && !this.state.location && (
            <Card id="welcome-card">
              <CardBody>
                <CardText>Where should it be close to?</CardText>
                <Input
                  type="text"
                  name="location"
                  id="locationTextBox"
                  placeholder=""
                  onChange={this.locationTextBoxChanged}
                />
                <Button
                  className="button"
                  onClick={this.locationBtnClicked}
                  name="useCurrentLocation"
                >
                  Use current location
                </Button>
                <Button
                  className="button"
                  onClick={this.locationBtnClicked}
                  name="location"
                >
                  Submit
                </Button>
              </CardBody>
            </Card>
          )}

          {this.state.eventDate &&
            this.state.location &&
            !this.state.travelMethod && (
              <Card id="welcome-card">
                <CardBody>
                  <CardText>
                    How long should it take to get there (minutes)?
                  </CardText>
                  {/*<Slider
                    value={this.state.travelMinutes}
                    onSliderChange={this.handleTravelMinutesChange}
                  />*/}
                  <Input
                    type="text"
                    name="proximityMinutes"
                    id="proximityMinutesTextBox"
                    placeholder=""
                    value={this.state.proximityMinutes}
                    onChange={this.proximityMinutesTextBoxChanged}
                  />
                  By what method of transport?
                  <Button
                    className="button"
                    onClick={this.proximityBtnClicked}
                    name="walk"
                  >
                    Walk
                  </Button>
                  <Button
                    className="button"
                    onClick={this.proximityBtnClicked}
                    name="cycle"
                  >
                    Cycle
                  </Button>
                  <Button
                    className="button"
                    onClick={this.proximityBtnClicked}
                    name="car"
                  >
                    Car
                  </Button>
                  <Button
                    className="button"
                    onClick={this.proximityBtnClicked}
                    name="publicTransport"
                  >
                    Public transport
                  </Button>
                </CardBody>
              </Card>
            )}

          {this.state.travelMethod && (
            <div id="cardTable-container">
              {this.state.activityShouldbeIndoors
                ? `Weather is going to be ${
                    this.state.activityShouldbeIndoors
                  } to be outdoors. Returning Indoor options.`
                : 'Weather is going to be fine for outdoor play!'}
              <CardTable
                cardId="kids-activity-results-card"
                cardText="Kids Activity Results"
                tableId="kids-activity-results-table"
                placeResultsArray={this.state.kidsActivityResults}
              />
              <CardTable
                cardId="cafe-results-card"
                cardText="Cafe Results"
                tableId="cafe-results-table"
                placeResultsArray={this.state.cafeResults}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
