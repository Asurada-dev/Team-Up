const express = require('express');
const router = express.Router();
const {
  createMovie,
  getAllMovies,
  getSingleMovie,
  getMovieSchedule,
  getMovieReleaseDate,
  updateMovie,
  deleteMovie,
} = require('../controllers/movie_controller');

router.get('/', getAllMovies);
// router.get('/movie-info/:id', getSingleMovie);
router.get('/:id', getSingleMovie);
router.get('/movie-schedule/:id', getMovieSchedule);
router.get('/movie-release-date/:id', getMovieReleaseDate);

module.exports = router;
