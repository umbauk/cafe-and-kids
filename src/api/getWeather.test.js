import { getWeather } from './getWeather.js';
import Config from '../config.js';
const KEY = Config.passwords.OPEN_WEATHER_KEY;

describe('getWeather', () => {
  it('sends correctly formatted api request url to openweathermap.org', done => {
    const mockSuccessResponse = { success: 'Success' };
    const mockJsonPromise = Promise.resolve(mockSuccessResponse);
    const mockFetchPromise = Promise.resolve({ json: () => mockJsonPromise });
    jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise);

    const coords = {
      lat: () => {
        return 53.345;
      },
      lng: () => {
        return -6.259;
      },
    };
    const returnValue = getWeather(coords);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.openweathermap.org/data/2.5/forecast?lat=53.345&lon=-6.259&APPID=${KEY}`,
    );
    expect(returnValue).toEqual(mockJsonPromise);

    global.fetch.mockClear();
    done();
  });
});
