import {
  limitNumberOfPlaces,
  checkPlaceIsWithinRadius,
} from './refreshNearbyPlaces.js';

describe('checkPlaceIsWithinRadius', () => {
  it('identifies correctly which places are in specificed radius of a center point', () => {
    const highRatedKidsPlaceArrayMock = [
      {
        geometry: {
          // within 1000m (800m)
          location: {
            lat: () => 37.4569262,
            lng: () => -122.1447332,
          },
        },
      },
      {
        geometry: {
          // outside 1000m (2.4km)
          location: {
            lat: () => 37.4506774,
            lng: () => -122.1542539,
          },
        },
      },
      {
        geometry: {
          // way outside 1000m
          location: {
            lat: () => 37.4520267,
            lng: () => -122.1694425,
          },
        },
      },
    ];
    const centerPointMock = {
      lat: 37.4462537,
      lng: -122.1452444,
    };
    const searchRadiusMock = 500;
    const returnArray = checkPlaceIsWithinRadius(
      centerPointMock,
      searchRadiusMock,
      highRatedKidsPlaceArrayMock,
    );
    expect(returnArray).toHaveLength(1);
    expect(returnArray[0].geometry.location.lat()).toEqual(
      highRatedKidsPlaceArrayMock[0].geometry.location.lat(),
    );
  });
});

describe('limitNumberOfPlaces', () => {
  const sortedKidsPlacesArray = [
    {
      placeType: 'cafe',
    },
    {
      placeType: 'cafe',
    },
    {
      placeType: 'cafe',
    },
    {
      placeType: 'cafe',
    },
    {
      placeType: 'cafe',
    },
    {
      placeType: 'cafe',
    },
    {
      placeType: 'kids activity',
    },
    {
      placeType: 'kids activity',
    },
    {
      placeType: 'kids activity',
    },
    {
      placeType: 'kids activity',
    },
    {
      placeType: 'kids activity',
    },
    {
      placeType: 'kids activity',
    },
  ];
  it('returns the correct number of places', () => {
    const limit = 5;
    const returnValue = limitNumberOfPlaces(sortedKidsPlacesArray, limit);
    expect(returnValue).toHaveLength(limit * 2);
  });
});
