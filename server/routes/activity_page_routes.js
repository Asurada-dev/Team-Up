const express = require('express');
const router = express.Router();

const { checkIsActivityMember } = require('../utils');

router.get('/', (req, res) => {
  res.render('pages/activity');
});

router.get('/activity-info/:id', async (req, res) => {
  const { id: activityId } = req.params;
  const userId = req.user.userId;
  const page = await checkIsActivityMember(activityId, userId);

  res.render(`pages/activity/activity_${page}`);
});

module.exports = router;
