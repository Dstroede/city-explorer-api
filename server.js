'use strict';

require('dotenv').config();
const express = require('express');
const cors = require ('cors');
const app = express();
const getWeather = require ('./modules/Weather.js');
const getMovies = require ('./modules/Movies.js');

app.use(cors());

const PORT = process.env.PORT || 3002;

app.get('/', (request, response, next) => {
  response.status(200).send('Default Route Working');
});

app.get('/weather', getWeather);
app.get('/movies', getMovies);

app.use((error, req,res, next)=> {
  console.error(error);
  res.status(500).json({error: error.message});
});

app.listen (PORT, () => console.log(`listening on ${PORT}`));
