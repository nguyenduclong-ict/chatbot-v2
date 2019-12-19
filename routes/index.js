var express = require('express');
var router = express.Router();

router.get('/app', (req, res) => {
  res.render('index');
});

module.exports = router;
