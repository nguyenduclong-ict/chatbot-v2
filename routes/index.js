var express = require('express');
var router = express.Router();
const path = require('path');

router.get('/policy', (req, res) => {
  res.render('policy');
});

// Export module
module.exports = router;
