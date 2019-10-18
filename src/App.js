import React, { Component } from 'react';
import { Card, CardText, CardBody, CardTitle, Button, Input, Table } from 'reactstrap';
import './App.css';
import { getPlacesAndUpdateListings } from './api/getPlacesAndUpdateListings';
import { getCurrentLocation } from './api/getCurrentLocation';
import { getWeather } from './api/getWeather';
import { lookupPlaceName } from './api/lookupPlaceName';
import loadJS from './loadJS.js'; // loads Google Maps API script

/* global google */

const CardTable = ({ cardId, cardText, tableId, placeResultsArray }) => (
  <Card id={cardId}>
    <CardBody className='results-table-body'>
      <CardText className='table-title'>{cardText}</CardText>
      {placeResultsArray && <ResultsTable id={tableId} placeResultsArray={placeResultsArray} />}
    </CardBody>
  </Card>
);

const ResultsTable = ({ placeResultsArray }) => (
  <Table borderless>
    <thead>
      <tr>
        <th>Label</th>
        <th>Place name</th>
        <th>Rating</th>
      </tr>
    </thead>
    <tbody>
      {placeResultsArray.map(place => [
        <tr key={place.kidsPlace.label}>
          <th scope='row' className='green-bg'>
            <center>{place.kidsPlace.label}</center>
          </th>
          <td>
            <a target='_blank' rel='noopener noreferrer' href={place.kidsPlace.url}>
              {place.kidsPlace.name}
            </a>
          </td>
          <td>
            <center>{place.kidsPlace.rating}</center>
          </td>
        </tr>,
        <tr key={place.cafe.label}>
          <th scope='row' className='red-bg'>
            <center>{place.cafe.label}</center>
          </th>
          <td>
            <a target='_blank' rel='noopener noreferrer' href={place.cafe.url}>
              {place.cafe.name}
            </a>
          </td>
          <td>
            <center>{place.cafe.rating}</center>
          </td>
        </tr>,
        <tr className='blank-row' key={place.cafe.label + place.kidsPlace.label}>
          <td colSpan='3'></td>
        </tr>,
      ])}
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
      placeResults: '',
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
    const KEY =
      window.location.hostname === 'localhost'
        ? process.env.REACT_APP_GOOGLE_API_KEY
        : 'AIzaSyB71MXo5ATeGeIlxvujjS9HQlTLz7pFV8Q'; // host restricted
    loadJS(`https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&callback=initMap`);
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
        placeResults: placeLabelsAndUrlArray,
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
      this.autocomplete = new google.maps.places.Autocomplete(input, { types: ['geocode'] });
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

    if (centerCoords === 'UNKNOWN') {
      alert('Place not found. Please enter a new place');
    } else {
      this.setState({
        location: 1,
      });
      map.panTo(centerCoords);
      map.setCenter(centerCoords);
      map.setZoom(13);
    }
  };

  getCenterCoords = (evt, map) => {
    return new Promise(async (resolve, reject) => {
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

  proximityMinutesInputBoxChanged = evt => {
    this.setState({
      proximityMinutes: evt.target.value,
    });
  };

  proximityBtnClicked = evt => {
    let proximityMinutes;
    if (this.state.proximityMinutes === '') {
      // user has not entered a number in the input field
      proximityMinutes = 10;
      this.setState({
        proximityMinutes: 10,
      });
    } else {
      proximityMinutes = this.state.proximityMinutes;
    }
    this.setState({
      travelMethod: evt.target.name,
    });
    const searchRadius = this.distanceCalculation(evt.target.name, proximityMinutes);
    this.setState({
      searchRadius: searchRadius,
    });
    this.updateListings(searchRadius);
  };

  distanceCalculation = (travelMethod, proximityMinutes) => {
    const SPEED_OF_TRANSPORT_IN_METRES_PER_HOUR = {
      walk: 5000,
      cycle: 10000,
      car: 40000,
      publicTransport: 20000,
    };
    const searchRadius = (
      (SPEED_OF_TRANSPORT_IN_METRES_PER_HOUR[travelMethod] * proximityMinutes) /
      60
    ).toString();

    return searchRadius;
  };

  handleTravelMinutesChange = value => {
    this.setState({ travelMinutes: value });
  };

  render() {
    return (
      <div id='parent-window'>
        <div id='map-element' ref={mapElement => (this.mapElement = mapElement)} />

        <div id='cardtable-container'>
          {!this.state.eventDate && (
            <Card id='welcome-card'>
              <CardBody>
                <CardTitle>
                  <div id='cafe-and-kids'>Cafe and Kids</div>
                  <div id='subtitle'>Find great playgrounds near great coffee!</div>
                </CardTitle>
                <CardText>When would you like to do your family activity?</CardText>
                <Button
                  className='button date-btn'
                  color='primary'
                  onClick={this.dateBtnClicked}
                  name='today'
                >
                  Today
                </Button>
                <Button
                  className='button date-btn'
                  color='primary'
                  onClick={this.dateBtnClicked}
                  name='tomorrow'
                >
                  Tomorrow
                </Button>
              </CardBody>
            </Card>
          )}

          {this.state.eventDate && !this.state.location && (
            <Card id='welcome-card'>
              <CardBody>
                <CardTitle>
                  <div id='cafe-and-kids'>Cafe and Kids</div>
                </CardTitle>
                <CardText>Where should it be near?</CardText>
                <Input
                  type='text'
                  spellCheck='false'
                  name='location'
                  id='locationTextBox'
                  placeholder=''
                  onChange={this.locationTextBoxChanged}
                />
                <Button
                  className='button'
                  color='primary'
                  onClick={this.locationBtnClicked}
                  name='location'
                >
                  Submit
                </Button>
                <Button
                  className='button'
                  color='primary'
                  onClick={this.locationBtnClicked}
                  name='useCurrentLocation'
                >
                  Use current location
                </Button>
              </CardBody>
            </Card>
          )}

          {this.state.eventDate && this.state.location && !this.state.travelMethod && (
            <Card id='welcome-card'>
              <CardBody>
                <CardTitle>
                  <div id='cafe-and-kids'>Cafe and Kids</div>
                </CardTitle>
                <CardText>
                  How many <b>minutes</b> should it take to get there?
                </CardText>
                <Input
                  type='select'
                  name='proximityMinutes'
                  id='proximityMinutesInputBox'
                  value={this.state.proximityMinutes}
                  onChange={this.proximityMinutesInputBoxChanged}
                >
                  <option>10</option>
                  <option>15</option>
                  <option>20</option>
                  <option>30</option>
                  <option>45</option>
                  <option>60</option>
                  <option>90</option>
                </Input>
                <br />
                How will you be travelling? <br />
                <Button
                  className='button transport-btn'
                  color='primary'
                  onClick={this.proximityBtnClicked}
                  name='walk'
                >
                  Walk
                </Button>
                <Button
                  className='button transport-btn'
                  color='primary'
                  onClick={this.proximityBtnClicked}
                  name='cycle'
                >
                  Cycle
                </Button>
                <br />
                <Button
                  className='button transport-btn'
                  color='primary'
                  onClick={this.proximityBtnClicked}
                  name='car'
                >
                  Car
                </Button>
                <Button
                  className='button transport-btn'
                  onClick={this.proximityBtnClicked}
                  color='primary'
                  name='publicTransport'
                >
                  Public transport
                </Button>
              </CardBody>
            </Card>
          )}

          {this.state.travelMethod && (
            <Card id='welcome-card'>
              <CardBody>
                <CardTitle>
                  <div id='cafe-and-kids'>Cafe and Kids</div>
                </CardTitle>
                <CardText>
                  {this.state.activityShouldbeIndoors
                    ? `Weather is going to be ${this.state.activityShouldbeIndoors} to be outdoors. Returning Indoor options.`
                    : 'Weather is going to be fine for outdoor play!'}
                  <br />
                  Drag the map to update search results
                </CardText>
                <div className='spacer' />
                <CardTable
                  cardId='kids-activity-results-card'
                  cardText='Results'
                  tableId='kids-activity-results-table'
                  placeResultsArray={this.state.placeResults}
                />
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    );
  }
}

export default App;
