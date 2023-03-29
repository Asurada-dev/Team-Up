const pool = require('../db/connectDB');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createMovie = async (req, res) => {};

const getAllMovies = async (req, res) => {
  const movieQuery = await pool.query(
    'SELECT * FROM movie LEFT JOIN movie_info ON movie.id=movie_info.movie_id;'
  );

  const allMovies = movieQuery.rows;
  res.status(StatusCodes.OK).json(allMovies);
};

const getSingleMovie = async (req, res) => {
  const { id: movieId } = req.params;
  const movieQuery = await pool.query(
    'SELECT * FROM movie LEFT JOIN movie_info ON movie.id=movie_info.movie_id WHERE movie.id=$1;',
    [movieId]
  );
  const movieInfo = movieQuery.rows[0];
  if (!movieInfo) {
    throw new CustomError.BadRequestError(`No movie with id: ${movieId}`);
  }
  res.status(StatusCodes.OK).json(movieInfo);
};

const getMovieReleaseDate = async (req, res) => {
  const { id: movieId } = req.params;

  const movieQuery = await pool.query(
    `SELECT date FROM movie_schedule WHERE movie_id=$1 GROUP BY movie_schedule.date ORDER BY date;`,
    [movieId]
  );
  const movieReleaseDate = movieQuery.rows;

  if (!movieReleaseDate[0]) {
    throw new CustomError.BadRequestError(
      `${movieId} is not currently in theaters.`
    );
  }
  res.status(StatusCodes.OK).json(movieReleaseDate);
};

const getMovieSchedule = async (req, res) => {
  const { id: movieId } = req.params;
  const { date } = req.query;

  if (!movieId || !date) {
    throw new CustomError.BadRequestError(`Please provide movie id and date.`);
  }
  const movieQuery = await pool.query(
    `SELECT  
      movie_schedule.id,
      movie.title,
      movie_schedule.movie_id,
      movie_schedule.date,
      movie_schedule.time,
      city.name AS city,
      theater.name AS theater
     FROM movie LEFT 
    JOIN movie_schedule ON movie.id=movie_schedule.movie_id 
    JOIN theater ON movie_schedule.theater_id=theater.id 
    JOIN city ON theater.city_id=city.id
    WHERE movie_id=$1 AND date=$2`,
    [movieId, date]
  );
  const movieSchedule = movieQuery.rows;
  if (!movieSchedule[0]) {
    throw new CustomError.BadRequestError(
      `${movieId} was not release on ${date}.`
    );
  }

  res.status(StatusCodes.OK).json(movieSchedule);
};

const updateMovie = async (req, res) => {};
const deleteMovie = async (req, res) => {};
module.exports = {
  createMovie,
  getAllMovies,
  getSingleMovie,
  getMovieSchedule,
  getMovieReleaseDate,
  updateMovie,
  deleteMovie,
};
