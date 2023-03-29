const express = require('express');
const router = express.Router();
const {
  getCurrentUser,
  getAllUsers,
  getSingleUser,
  updateUser,
} = require('../controllers/user_controller');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/authentication');

router.get('/current-user', authenticateUser, getCurrentUser);
router.get('/', authenticateUser, authorizePermissions('admin'), getAllUsers);
router.get('/:id', authenticateUser, getSingleUser);
router.patch('/update', authenticateUser, updateUser);

module.exports = router;
