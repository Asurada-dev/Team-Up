const pool = require('../db/connectDB');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const movieModel = require('../models/movie_model');

const getAllMovies = async (req, res) => {
  const allMovies = await movieModel.getAllMovies();

  res.status(StatusCodes.OK).json(allMovies);
};

const getSingleMovie = async (req, res) => {
  const { id: movieId } = req.params;

  if (!movieId) {
    throw new CustomError.BadRequestError(`Please provide movie id.`);
  }

  const movieInfo = await movieModel.getMovieById(movieId);

  if (!movieInfo) {
    throw new CustomError.BadRequestError(`No movie with id: ${movieId}`);
  }

  res.status(StatusCodes.OK).json(movieInfo);
};

const getMovieReleaseDate = async (req, res) => {
  const { id: movieId } = req.params;

  if (!movieId) {
    throw new CustomError.BadRequestError(`Please provide movie id.`);
  }

  const movieReleaseDate = await movieModel.getMovieReleaseDate(movieId);

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

  const movieSchedule = await movieModel.getMovieSchedule(movieId, date);

  if (!movieSchedule[0]) {
    throw new CustomError.BadRequestError(
      `${movieId} was not release on ${date}.`
    );
  }

  res.status(StatusCodes.OK).json(movieSchedule);
};

module.exports = {
  getAllMovies,
  getSingleMovie,
  getMovieSchedule,
  getMovieReleaseDate,
};
