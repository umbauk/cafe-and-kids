// api.openweathermap.org/data/2.5/forecast?lat=35&lon=139&APPID=c0015c7da948e2feeea7c878cc929a9c
// lat: 53.345806, lng: -6.259674,

//const fetch = require('node-fetch');

export function getWeather(coords) {
  return fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat()}&lon=${coords.lng()}&APPID=c0015c7da948e2feeea7c878cc929a9c`,
  )
    .then(res => res.json())
    .then(result => {
      return result;
    });
}
