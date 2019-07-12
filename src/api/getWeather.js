import Config from '../config.js';
const KEY = Config.passwords.OPEN_WEATHER_KEY;

export function getWeather(coords) {
  return fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat()}&lon=${coords.lng()}&APPID=${KEY}`,
  )
    .then(res => res.json())
    .then(result => {
      return result;
    });
}
