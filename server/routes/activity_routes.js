const express = require('express');
const router = express.Router();
const {
  createActivity,
  uploadActivityImage,
  joinActivity,
  getAllActivities,
  getSingleActivity,
  getActivityMembers,
  updateActivity,
  deleteActivity,
} = require('../controllers/activity_controller');

const { authenticateUser } = require('../middlewares/authentication');

router.get('/', getAllActivities);
router.get('/members/:id', authenticateUser, getActivityMembers);
router.get('/:id', getSingleActivity);
router.post('/', authenticateUser, createActivity);
router.post('/upload-image', authenticateUser, uploadActivityImage);
router.post('/:id', authenticateUser, joinActivity);
router.patch('/:id', authenticateUser, updateActivity);
router.delete('/:id', authenticateUser, deleteActivity);

module.exports = router;
