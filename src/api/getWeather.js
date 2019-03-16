const KEY = 'c0015c7da948e2feeea7c878cc929a9c';

export function getWeather(coords) {
  return fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat()}&lon=${coords.lng()}&APPID=${KEY}`,
  )
    .then(res => res.json())
    .then(result => {
      return result;
    });
}
