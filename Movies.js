'use strict';

require('dotenv').config();
const express = require('express');
const cors = require ('cors');
const axios = require ('axios');
const app = express();

app.use(cors());

const PORT = process.env.PORT || 3002;

const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

app.get('/movies', async (req, res, next) => {
  try {
    const city = req.query.searchQuery;
    console.log('this is city,', city);
    if (!city) {
      return res.status(400).send('Missing Parameter');
    }

    const moviedbURL = await axios.get(`https://api.themoviedb.org/3/search/movie/?api_key=${MOVIE_API_KEY}&language=en-US&page=1&query=${city}`);
    if (moviedbURL.status !== 200) {
      return res.status(404).send('No Movies Found');
    }
    const movieData = moviedbURL.data.results[0];

    const flix =  new Movies(movieData);
    console.log(movieData);
    res.status(200).send(flix);
  }
  catch(error){
    next(error);
  }

});
class Movies {
  constructor(movieObj){
    this.title = movieObj.title;
    this.movieImage = movieObj.poster_path;
    this.release = movieObj.release_date;
  }
}

app.use((error, req,res, next)=> {
  console.error(error);
  res.status(500).json({error: error.message});
});

app.listen (PORT, () => console.log(`listening on ${PORT}`));
