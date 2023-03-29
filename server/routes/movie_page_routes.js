const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/movie');
});

router.get('/movie-info/:id', (req, res) => {
  res.render('pages/movie/movie_info');
});

module.exports = router;
