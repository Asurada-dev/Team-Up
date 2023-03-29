const pool = require('../db/connectDB');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const getCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const getAllUsers = async (req, res) => {
  const userQuery = await pool.query('SELECT * FROM users;');
  const allUsers = userQuery.rows;
  res.status(StatusCodes.OK).json(allUsers);
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const userQuery = await pool.query('SELECT * FROM users WHERE id=$1;', [
    userId,
  ]);

  const singleUser = userQuery.rows[0];

  if (!singleUser) {
    throw new CustomError.BadRequestError(`No user with id: ${userId}`);
  }
  res.status(StatusCodes.OK).json(singleUser);
};

const updateUser = async (req, res) => {
  const { name } = req.body;
  console.log(name);
  if (!name) {
    throw new CustomError.BadRequestError('Please provide all values.');
  }

  const temp = await pool.query('UPDATE users SET name=$1 WHERE id=$2;', [
    name,
    req.user.userId,
  ]);
  console.log(req.user.userId);
  // console.log(temp);
  res.status(StatusCodes.OK).json('Success! Your profile has been updated.');
};

module.exports = {
  getCurrentUser,
  getAllUsers,
  getSingleUser,
  updateUser,
};
