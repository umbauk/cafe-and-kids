import dotenv from 'dotenv';
dotenv.config();

export function getWeather(coords) {
  const KEY =
    window.location.hostname === 'localhost'
      ? process.env.REACT_APP_OPEN_WEATHER_KEY
      : process.env.OPEN_WEATHER_KEY;
  return fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat()}&lon=${coords.lng()}&APPID=${KEY}`,
  )
    .then(res => res.json())
    .then(result => {
      return result;
    });
}
