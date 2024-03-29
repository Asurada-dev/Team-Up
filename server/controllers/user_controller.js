const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const userModel = require('../models/user_model');

const getCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const getAllUsers = async (req, res) => {
  const allUsers = await userModel.getAllUsers();
  res.status(StatusCodes.OK).json(allUsers);
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;

  const singleUser = await userModel.getUserById(userId);

  if (!singleUser) {
    throw new CustomError.BadRequestError(`No user with id: ${userId}`);
  }

  res.status(StatusCodes.OK).json(singleUser);
};

const updateUser = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new CustomError.BadRequestError('Please provide all values.');
  }
  await userModel.updateUserProfile(req.user.userId, name);

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! Your profile has been updated.' });
};

module.exports = {
  getCurrentUser,
  getAllUsers,
  getSingleUser,
  updateUser,
};
