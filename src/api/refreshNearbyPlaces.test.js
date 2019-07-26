import {
  limitNumberOfPlaces,
  checkPlaceIsWithinRadius,
} from './refreshNearbyPlaces.js';

describe('checkPlaceIsWithinRadius', () => {
  const highRatedKidsPlaceArrayMock = [
    {
      geometry: {
        // within 1000m (800m)
        location: {
          lat: () => 37.46098,
          lng: () => -122.138839,
        },
      },
    },
    {
      geometry: {
        // outside 1000m (2.4km)
        location: {
          lat: () => 37.436942,
          lng: () => -122.157213,
        },
      },
    },
    {
      geometry: {
        // way outside 1000
        location: {
          lat: () => 37.355814,
          lng: () => -122.179102,
        },
      },
    },
  ];
  const centerPointMock = {
    lat: 37.453638,
    lng: -122.140341,
  };
  it('identifies correctly which places are in 1000m of a center point', () => {
    const searchRadiusMock = 1000;
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
  it('identifies correctly which places are in 2500m of a center point', () => {
    const searchRadiusMock = 2500;
    const returnArray = checkPlaceIsWithinRadius(
      centerPointMock,
      searchRadiusMock,
      highRatedKidsPlaceArrayMock,
    );
    expect(returnArray).toHaveLength(2);
    expect(returnArray[0].geometry.location.lat()).toEqual(
      highRatedKidsPlaceArrayMock[0].geometry.location.lat(),
    );
    expect(returnArray[1].geometry.location.lat()).toEqual(
      highRatedKidsPlaceArrayMock[1].geometry.location.lat(),
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
