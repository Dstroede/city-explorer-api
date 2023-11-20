'use strict';

require('dotenv').config();
const express = require('express');
const cors = require ('cors');
const axios = require ('axios');
const app = express();

app.use(cors());

const PORT = process.env.PORT || 3002;

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

app.get('/', (request, response, next) => {
  response.status(200).send('Default Route Working');
});

app.get('/weather', async (req, res, next) => {
  try {
    const lat = req.query.lat;
    const lon = req.query.lon;
      console.log(lat, lon)
    if (!lat || !lon) {
      return res.status(400).send('Missing Parameter');
    }

    const weatherbitURL = await axios.get(`http://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}&include=minutely`);
    if (weatherbitURL.status !== 200) {
      return res.status(404).send('No City Found');
    }
    const weatherData = weatherbitURL.data.data[0];

    const forecasts =  new Forecast(weatherData);
    console.log(weatherData);
    res.status(200).send(forecasts);
  }
  catch(error){
    next(error);
  }

});
app.get('/movies', async (req, res, next) => {
  try {
    const city = req.query.searchQuery;
    console.log('this is city,', city);
    if (!city) {
      return res.status(400).send('Missing Parameter');
    }

    const moviedbURL = await axios.get(`https://api.themoviedb.org/3/search/movie?query=${city}&api_key=${MOVIE_API_KEY}`);
    if (moviedbURL.status !== 200) {
      return res.status(404).send('No Movies Found');
    }
    const movieData = moviedbURL.data.results.slice(0, 20);

    const flix =  new Movies(movieData);
    console.log(movieData);
    res.status(200).send(flix);
  }
  catch(error){
    next(error);
  }
});

class Forecast {
  constructor(weatherObj){
    this.date = weatherObj.datetime;
    this.temp = weatherObj.app_temp;
    this.weather = {
      description: weatherObj.weather.description
    };
  }
}
class Movies {
  constructor(movieObj){
    this.title = movieObj.title;
    this.release = movieObj.release_date;
    this.summary = movieObj.overview;
  }
}
app.use((error, req,res, next)=> {
  console.error(error);
  res.status(500).json({error: error.message});
});

app.listen (PORT, () => console.log(`listening on ${PORT}`));
