import {
  limitNumberOfPlaces,
  checkPlaceIsWithinRadius,
  filterOutLowRatedPlaces,
} from './refreshNearbyPlaces.js';

describe('filterOutLowRatedPlaces', () => {
  it('filters out ratings below specified value', () => {
    const mockPlacesArray = [
      { rating: 2.4 },
      { rating: 3.4 },
      { rating: 3.4999 },
      { rating: 3.5 },
      { rating: 3.6 },
      { rating: 5.0 },
    ];
    const returnArray = filterOutLowRatedPlaces(mockPlacesArray, 3.5);
    expect(returnArray).toHaveLength(3);
    expect(returnArray).toEqual(mockPlacesArray.slice(3));
  });
});

describe('checkPlaceIsWithinRadius', () => {
  const highRatedKidsPlaceArrayMock = [
    {
      geometry: {
        // 800m from centre point
        location: {
          lat: () => 37.46098,
          lng: () => -122.138839,
        },
      },
    },
    {
      geometry: {
        // 2.4km from centre point
        location: {
          lat: () => 37.436942,
          lng: () => -122.157213,
        },
      },
    },
    {
      geometry: {
        // 11.4km from centre point
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
