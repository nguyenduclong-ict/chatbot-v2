var express = require('express');
var router = express.Router();

router.get('/app', (req, res) => {
  res.render('index');
});

router.get('/policy', (req, res) => {
  res.render('policy');
});

// Export module
module.exports = router;
