const express = require('express');
const router = express.Router();

router.get('/my-activity', (req, res) => {
  res.render('pages/user/my_activity');
});

module.exports = router;
