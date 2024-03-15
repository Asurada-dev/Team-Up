const pool = require('../db/connectDB');

const getAllMovies = async () => {
  const movieQuery = await pool.query(
    'SELECT * FROM movie LEFT JOIN movie_info ON movie.id=movie_info.movie_id WHERE movie_info.movie_id IS NOT NULL ORDER BY movie_info.release_date DESC;'
  );

  return movieQuery.rows;
};

const getMovieById = async (movieId) => {
  const movieQuery = await pool.query(
    'SELECT * FROM movie LEFT JOIN movie_info ON movie.id=movie_info.movie_id WHERE movie.id=$1;',
    [movieId]
  );
  return movieQuery.rows[0];
};

const getMovieReleaseDate = async (movieId) => {
  const movieQuery = await pool.query(
    `SELECT date FROM movie_schedule WHERE movie_id=$1 GROUP BY movie_schedule.date ORDER BY date;`,
    [movieId]
  );

  return movieQuery.rows;
};

const getMovieSchedule = async (movieId, date) => {
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
        WHERE movie_id=$1 AND date=$2 ORDER BY movie_schedule.time;`,
    [movieId, date]
  );
  return movieQuery.rows;
};

module.exports = {
  getAllMovies,
  getMovieById,
  getMovieReleaseDate,
  getMovieSchedule,
};
