const express = require('express');
const router = express.Router();
const {
  createActivity,
  uploadActivityImage,
  joinActivity,
  leaveActivity,
  getAllActivities,
  getSingleActivity,
  getUserJoinedActivity,
  getActivityMembers,
  updateActivity,
  deleteActivity,
  getChatLog,
  getCurrentMemberRole,
} = require('../controllers/activity_controller');

const { authenticateUser } = require('../middlewares/authentication');

router.get('/', getAllActivities);
router.get('/role/:id', authenticateUser, getCurrentMemberRole);
router.get('/my-activity', authenticateUser, getUserJoinedActivity);
router.get('/members/:id', authenticateUser, getActivityMembers);
router.get('/chat-log/:id', authenticateUser, getChatLog);
router.get('/:id', getSingleActivity);
router.post('/', authenticateUser, createActivity);
router.post('/upload-image', authenticateUser, uploadActivityImage);
router.post('/:id', authenticateUser, joinActivity);
router.patch('/:id', authenticateUser, updateActivity);
router.delete('/leave/:id', authenticateUser, leaveActivity);
router.delete('/:id', authenticateUser, deleteActivity);

module.exports = router;
