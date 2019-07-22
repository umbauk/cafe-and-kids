import {
  getEventDayWeatherForecast,
  getUTCOffsetForLocation,
  checkIfRainingOrTooCold,
} from './getEventDayWeatherForecast.js';
import Config from '../config.js';
const KEY = Config.passwords.GOOGLE_API_KEY;

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
      `https:\/\/maps\.googleapis\.com\/maps\/api\/timezone\/json\\?location=${
        coords.lat
      },${coords.lng}&timestamp=.+`,
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(fetchUrlRegex),
    );
    expect(returnValue).toEqual(mockJsonPromise);
    done();
  });
});

describe('getEventDayWeatherForecast', () => {
  const hours = 1000 * 60 * 60;
  console.log(Date.now());
  const mockWeatherJSON = {
    list: [
      { dt: Date.now() },
      { dt: Date.now() - 3 * hours },
      { dt: Date.now() - 6 * hours },
      { dt: Date.now() - 9 * hours },
      { dt: Date.now() + 3 * hours },
      { dt: Date.now() + 6 * hours },
      { dt: Date.now() + 9 * hours },
    ],
  };
  it('works', () => {
    const todaysDate = new Date();
    const returnValue = getEventDayWeatherForecast(
      'tomorrow',
      mockWeatherJSON,
      -8,
      todaysDate,
    );

    expect(returnValue).toEqual();
  });
});

describe('checkIfRainingOrTooCold', () => {
  it('works', () => {});
});

global.fetch.mockClear();
