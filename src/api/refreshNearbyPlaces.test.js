import {
  limitNumberOfPlaces,
  checkPlaceIsWithinRadius,
  filterOutLowRatedPlaces,
  getKidsPlacesArray,
  getCafesArray,
} from './refreshNearbyPlaces.js';

import getPlacesList from './getPlacesList';

jest.mock('./getPlacesList.js', (service, request) =>
  jest.fn((service, request) => {
    if (request.placeType === 'kids activity') {
      return new Promise(resolve => {
        const returnArray = [
          {
            placeType: 'kids activity',
            rating: 4.1,
            geometry: {
              location: {
                lat: () => 37.453638,
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'kids activity',
            rating: 3.9,
            geometry: {
              location: {
                lat: () => 37.453638,
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'kids activity',
            rating: 4.5,
            geometry: {
              location: {
                lat: () => 37.453638,
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'kids activity',
            rating: 4.8,
            geometry: {
              location: {
                lat: () => 38.453638, // outside radius
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'kids activity',
            rating: 4.0,
            geometry: {
              location: {
                lat: () => 37.453638,
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'kids activity',
            rating: 4.0,
            geometry: {
              location: {
                lat: () => 37.453638,
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'kids activity',
            rating: 4.0,
            geometry: {
              location: {
                lat: () => 37.453638,
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'kids activity',
            rating: 4.7,
            geometry: {
              location: {
                lat: () => 37.453638,
                lng: () => -122.140341,
              },
            },
          },
        ];
        resolve(returnArray);
      });
    } else if (request.placeType === 'cafe') {
      return new Promise(resolve => {
        const returnArray = [
          {
            placeType: 'cafe',
            rating: 3.9, // below min rating
            geometry: {
              location: {
                lat: () => 37.453638,
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'cafe',
            rating: 4.5,
            geometry: {
              location: {
                lat: () => 37.453638,
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'cafe',
            rating: 4.8,
            geometry: {
              location: {
                lat: () => 38.453638, // outside radius
                lng: () => -122.140341,
              },
            },
          },
          {
            placeType: 'cafe',
            rating: 4.7,
            geometry: {
              location: {
                lat: () => 38.453638,
                lng: () => -123.140341,
              },
            },
          },
        ];
        resolve(returnArray);
      });
    }
  }),
);

describe('getKidsPlacesArray', () => {
  const activityShouldBeIndoorsMock = false;
  const centerPointMock = {
    lat: 37.453638,
    lng: -122.140341,
  };
  const searchRadiusMock = 1000;
  const serviceMock = () => {};

  it('limits results to 5, filters out ratings less than 4, sorts by rating and filters out locations outside radius', async () => {
    const returnArray = await getKidsPlacesArray(
      activityShouldBeIndoorsMock,
      centerPointMock,
      searchRadiusMock,
      serviceMock,
    );
    expect(returnArray).toHaveLength(5);
    expect(returnArray[0].rating).toEqual(4.7);
    const ratingsFromReturnArray = returnArray.map(element => element.rating);
    expect(Math.min(...ratingsFromReturnArray)).toEqual(4);
    const latFromReturnArray = returnArray.map(element =>
      element.geometry.location.lat(),
    );
    expect(Math.max(...latFromReturnArray)).toEqual(37.453638);
  });
});

describe('getCafesArray', () => {
  const travelMethodMock = 'walk';
  const serviceMock = () => {};
  const limitedKidsPlacesArrayMock = [
    {
      geometry: {
        location: {
          lat: () => 37.453638,
          lng: () => -122.140341,
        },
      },
    },
    {
      geometry: {
        location: {
          lat: () => 38.453638,
          lng: () => -123.140341,
        },
      },
    },
  ];

  it('limits results to equal 1 per kids activity place, filters out ratings less than 4, sorts by rating and filters out locations outside radius', async () => {
    const returnArray = await getCafesArray(
      limitedKidsPlacesArrayMock,
      serviceMock,
      travelMethodMock,
    );
    expect(returnArray).toHaveLength(limitedKidsPlacesArrayMock.length);
    expect(returnArray[0][0].rating).toEqual(4.5);
    expect(returnArray[1][0].rating).toEqual(4.7);
    expect(returnArray[0][0].geometry.location.lat()).toEqual(37.453638);
    expect(returnArray[1][0].geometry.location.lat()).toEqual(38.453638);
  });
});

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
