const pool = require('../db/connectDB');

const createToken = async (userId, refreshToken, ip, userAgent) => {
  await pool.query(
    'INSERT INTO token (user_id, refresh_token, ip, user_agent) VALUES ($1, $2, $3, $4);',
    [userId, refreshToken, ip, userAgent]
  );
};

const getTokenByUserId = async (userId) => {
  const tokenQuery = await pool.query('SELECT * FROM token WHERE user_id=$1;', [
    userId,
  ]);
  return tokenQuery.rows[0];
};

const getTokenByRefreshToken = async (userId, refreshToken) => {
  const tokenQuery = await pool.query(
    'SELECT * FROM token WHERE user_id=$1 AND refresh_token=$2',
    [userId, refreshToken]
  );
  return tokenQuery.rows[0];
};

const deleteToken = async (userId) => {
  await pool.query('DELETE FROM token WHERE user_id=$1;', [userId]);
};

module.exports = {
  createToken,
  getTokenByUserId,
  getTokenByRefreshToken,
  deleteToken,
};
