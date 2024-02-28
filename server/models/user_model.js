const pool = require('../db/connectDB');
const bcrypt = require('bcryptjs');

const getAllUsers = async () => {
  const userQuery = await pool.query('SELECT * FROM users;');
  return userQuery.rows;
};

const getAllAdmins = async () => {
  const userQuery = await pool.query("SELECT * FROM users WHERE role='admin';");
  return userQuery.rows;
};

const getUserById = async (userId) => {
  const userQuery = await pool.query('SELECT * FROM users WHERE id=$1;', [
    userId,
  ]);
  return userQuery.rows[0];
};

const getUserByEmail = async (email) => {
  const userQuery = await pool.query('SELECT * FROM users WHERE email=$1;', [
    email,
  ]);
  return userQuery.rows[0];
};

const updateUserProfile = async (userId, newName) => {
  await pool.query('UPDATE users SET name=$1 WHERE id=$2;', [newName, userId]);
};

const createUser = async (name, email, password, role, verificationToken) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userQuery = await pool.query(
    'INSERT INTO users (name, email, password, role, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, verification_token;',
    [name, email, hashedPassword, role, verificationToken]
  );

  return userQuery.rows[0];
};

const updateUserToVerified = async (email) => {
  await pool.query(
    'UPDATE users SET verification_token=$1, is_verified=$2, verified_date=$3  WHERE email=$4;',
    ['', true, new Date(), email]
  );
};

const updatePasswordToken = async (
  passwordTokenHashed,
  passwordTokenExpirationDate,
  email
) => {
  await pool.query(
    'UPDATE users SET password_token=$1, password_token_expiration_date=$2 WHERE email=$3;',
    [passwordTokenHashed, passwordTokenExpirationDate, email]
  );
};

const updatePassword = async (newPassword, email) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  console.log(newPassword, hashedPassword, email);
  await pool.query(
    'UPDATE users SET password=$1, password_token=$2, password_token_expiration_date=$3 WHERE email=$4;',
    [hashedPassword, null, null, email]
  );
};

module.exports = {
  getAllUsers,
  getAllAdmins,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  createUser,
  updateUserToVerified,
  updatePasswordToken,
  updatePassword,
};
