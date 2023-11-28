'use strict';

const axios = require ('axios');
const cache = require('./cache');

const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

async function getMovies(req, res, next) {
  try {
    const city = req.query.searchQuery;
    console.log('this is city,', city);
    if (!city) {
      return res.status(400).send('Missing Parameter');
    }

    const key = `movies-${city}`;

    if(cache[key] && Date.now() - cache[key].timestamp < 3600000){
      console.log('Movies Cache Hit');
      res.status(200).send(cache[key].data);
    } else{
      console.log('Movies Cache Miss');
      const moviedbURL = await axios.get(`https://api.themoviedb.org/3/search/movie?query=${city}&api_key=${MOVIE_API_KEY}`);

      if (moviedbURL.status !== 200) {
        return res.status(404).send('No Movies Found');
      }
      const movieData = moviedbURL.data.results.slice(0, 20);
      const movieArray = movieData.map(movie =>
        new Movies({
          title: movie.title,
          release_date: movie.release_date,
          overview: movie.overview,

        }));

      cache[key]= {
        timestamp: Date.now(),
        data: movieArray,
      };
      res.status(200).send(movieArray);
    }
  }catch(error){
    next(error);
  }
}

class Movies {
  constructor(movieObj){
    this.title = movieObj.title;
    this.release = movieObj.release_date;
    this.summary = movieObj.overview;
  }
}

module.exports = getMovies;
