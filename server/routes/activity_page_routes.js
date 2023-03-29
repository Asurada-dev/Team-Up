const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/activity');
});

router.get('/activity-info/:id', (req, res) => {
  res.render('pages/activity/activity_info');
});

module.exports = router;
