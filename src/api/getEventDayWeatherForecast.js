const KEY =
  window.location.hostname === 'localhost'
    ? process.env.REACT_APP_GOOGLE_API_KEY
    : 'c0015c7da948e2feeea7c878cc929a9c'; // host restricted

export function getUTCOffsetForLocation(mapCenter) {
  const timestamp = Date.now() / 100; // seconds since 01 Jan 1970
  return fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${mapCenter.lat},${mapCenter.lng}&timestamp=${timestamp}&key=${KEY}`,
  )
    .then(res => res.json())
    .then(result => {
      // rawOffset is UTC offset in seconds. Convert to hours before returning
      return result.rawOffset / 60 / 60;
    });
}

export function getEventDayWeatherForecast(eventDate, weatherJSON, utcOffset, todaysDate) {
  let tomorrow = new Date();
  tomorrow.setFullYear(todaysDate.getFullYear(), todaysDate.getMonth(), todaysDate.getDate() + 1);
  tomorrow.setHours(todaysDate.getHours(), todaysDate.getMinutes());
  let eventDayForecast;

  // Forecasts are every 3 hours in UNIX UTC datetime. Get the forecasts that are for the day the user selected between 9am and 6pm
  // new Date(forecast.dt) returns time in current time zone, which should be converted to time in location selected, if different from current timezone
  if (eventDate === 'today') {
    eventDayForecast = weatherJSON.list.filter(
      forecast =>
        new Date(forecast.dt * 1000).toDateString() === todaysDate.toDateString() &&
        new Date(forecast.dt * 1000).getHours() >= 9 &&
        new Date(forecast.dt * 1000).getHours() <= 18,
    );
  } else if (eventDate === 'tomorrow') {
    eventDayForecast = weatherJSON.list.filter(
      forecast =>
        new Date(forecast.dt * 1000).toDateString() === tomorrow.toDateString() &&
        new Date(forecast.dt * 1000).getHours() >= 9 &&
        new Date(forecast.dt * 1000).getHours() <= 18,
    );
  }
  return eventDayForecast;
}

export function checkIfRainingOrTooCold(eventDayForecast) {
  const lowestTempForOutdoorActivity = 278; // kelvins = 5 degress celsius
  const highestTempForOutdoorActivity = 303; // kelvins = 30 degress celsius
  const maxRainInThreeHoursForOutdoorActivity = 7.5; // mm

  for (let i = 0; i < eventDayForecast.length; i++) {
    // forecasts don't have rain elements if there is 0 rain forecast
    if (eventDayForecast[i].rain) {
      if (eventDayForecast[i].rain['3h'] > maxRainInThreeHoursForOutdoorActivity) {
        return 'too rainy';
      }
    }
    if (eventDayForecast[i].main.temp > highestTempForOutdoorActivity) {
      return 'too hot';
    } else if (eventDayForecast[i].main.temp < lowestTempForOutdoorActivity) {
      return 'too cold';
    }
  }
  return false;
}
