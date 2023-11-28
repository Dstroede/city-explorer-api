'use strict';

const axios = require('axios');
const cache = require('./cache');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

async function getWeather(req, res, next) {
  try {
    const lat = req.query.lat;
    const lon = req.query.lon;
    console.log(lat, lon);
    if (!lat || !lon) {
      return res.status(400).send('Missing Parameter');
    }

    const key = `weather-${lat}-${lon}`;
    if(cache[key] && Date.now() - cache[key].timestamp < 3600000){
      console.log('Weather Cache Hit');
      res.status(200).send(cache[key].data);
    } else{
      console.log('Weather Cache Miss');
      const weatherbitURL = await axios.get(`http://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}&include=minutely`);

      if (weatherbitURL.status !== 200) {
        return res.status(404).send('No City Found');
      }

      const weatherData = weatherbitURL.data.data[0];
      const forecasts = new Forecast(weatherData);

      cache[key]= {
        timestamp: Date.now(),
        data: forecasts,
      };

      res.status(200).send(forecasts);
    }
  }catch (error) {
    next(error);
  }
}
class Forecast {
  constructor(weatherObj){
    this.date = weatherObj.datetime;
    this.temp = weatherObj.app_temp;
    this.weather = {
      description: weatherObj.weather.description
    };
  }
}
module.exports = getWeather;
