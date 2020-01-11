var express = require('express');
var router = express.Router();
const path = require('path');

router.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirroot, 'public', 'pages', 'index.html'));
});

router.get('/policy', (req, res) => {
  res.render('policy');
});

// Export module
module.exports = router;
