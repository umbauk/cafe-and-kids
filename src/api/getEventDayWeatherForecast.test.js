import {
  getEventDayWeatherForecast,
  getUTCOffsetForLocation,
  checkIfRainingOrTooCold,
} from './getEventDayWeatherForecast.js';
import dotenv from 'dotenv';
dotenv.config();
const KEY = process.env.REACT_APP_GOOGLE_API_KEY;

const mockSuccessResponse = 0;
const mockJsonPromise = Promise.resolve(mockSuccessResponse);
const mockFetchPromise = Promise.resolve({ json: () => mockJsonPromise });
jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise);

const coords = {
  lat: 53.345,
  lng: -6.259,
};

describe('getUTCOffsetForLocation', () => {
  it('calls expected URL and returns a promise', done => {
    const returnValue = getUTCOffsetForLocation(coords);

    const fetchUrlRegex = new RegExp(
      `https:\/\/maps\.googleapis\.com\/maps\/api\/timezone\/json\\?location=${coords.lat},${coords.lng}&timestamp=.+`,
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(fetchUrlRegex));
    expect(returnValue).toEqual(mockJsonPromise);
    done();
  });
});

describe('getEventDayWeatherForecast', () => {
  const hours = 60 * 60;
  const utcDateDividedBy1000 = Math.round(1563861348000 / 1000); // Monday, 22 July 2019 22:55:48
  const mockWeatherJSON = {
    list: [
      { dt: utcDateDividedBy1000 },
      { dt: utcDateDividedBy1000 - 3 * hours },
      { dt: utcDateDividedBy1000 - 6 * hours },
      { dt: utcDateDividedBy1000 - 9 * hours },
      { dt: utcDateDividedBy1000 - 12 * hours },
      { dt: utcDateDividedBy1000 - 15 * hours },
      { dt: utcDateDividedBy1000 + 3 * hours },
      { dt: utcDateDividedBy1000 + 6 * hours },
      { dt: utcDateDividedBy1000 + 9 * hours },
      { dt: utcDateDividedBy1000 + 12 * hours }, // Should pass
      { dt: utcDateDividedBy1000 + 15 * hours }, // Should pass
    ],
  };
  it('filters and returns the forecasts for the correct date and times', () => {
    const todaysDate = new Date(1563861348000); // Monday, 22 July 2019 22:55:48
    const returnValue = getEventDayWeatherForecast('tomorrow', mockWeatherJSON, -8, todaysDate);

    expect(returnValue).toEqual([
      { dt: utcDateDividedBy1000 + 12 * hours },
      { dt: utcDateDividedBy1000 + 15 * hours },
    ]);
  });
});

describe('checkIfRainingOrTooCold', () => {
  const tooRainyAndTooHot = [
    {
      rain: {
        '3h': 10,
      },
      main: {
        temp: 304,
      },
    },
  ];
  const tooCold = [
    {
      rain: {
        '3h': 2,
      },
      main: {
        temp: 100,
      },
    },
  ];
  const justRight = [
    {
      main: {
        temp: 290,
      },
    },
  ];
  const tooHot = [
    {
      rain: {
        '3h': 2,
      },
      main: {
        temp: 304,
      },
    },
  ];

  it('returns correct result when too rainy and hot', () => {
    const returnValue = checkIfRainingOrTooCold(tooRainyAndTooHot);
    expect(returnValue).toBe('too rainy');
  });
  it('returns correct result when too cold', () => {
    const returnValue = checkIfRainingOrTooCold(tooCold);
    expect(returnValue).toBe('too cold');
  });
  it('returns correct result when just right', () => {
    const returnValue = checkIfRainingOrTooCold(justRight);
    expect(returnValue).toBe(false);
  });
  it('returns correct result when too hot', () => {
    const returnValue = checkIfRainingOrTooCold(tooHot);
    expect(returnValue).toBe('too hot');
  });
});

global.fetch.mockClear();
