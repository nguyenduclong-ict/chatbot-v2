var express = require('express');
var router = express.Router();
var admin = require('firebase-admin');
const requireAll = require(__dirroot + '/utils/requireAll');
const pages = requireAll(__dirname + '/_pages');
const { VERIFY_TOKEN, APP_SECRET, SERVER_URL } = _get(
  require(__dirroot + '/config'),
  'facebook/genius'
);

/*
 * Be sure to setup your config values before running this code. You can
 * set them using environment variables or modifying the config file in /config.
 *
 */
if (!(APP_SECRET && VERIFY_TOKEN && SERVER_URL)) {
  _log('Missing config values');
  process.exit(1);
}

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
router.post('/webhook', function(req, res) {
  _log('on recived event', req.body);
  res.sendStatus(200);
  // Make sure this is a page subscription
  const data = req.body;
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      const page = pages.find(p => p.instance.PAGE_ID === pageID);
      if (page) pageEntry.messaging.forEach(page.instance.handleMessage);
    });
  }
});

// Accepts GET requests at the /webhook endpoint
router.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      _log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});

//
router.post('/mrcom/order-notification', (req, res) => {
  const { PAGE_ID } = _get(
    require(__dirroot + '/config'),
    'facebook/genius/pages/jarvis'
  );
  const page = pages.find(p => p.instance.PAGE_ID === PAGE_ID);
  page.instance.handleNotificationOrder(req, res);
  res.sendStatus(200);
});
module.exports = router;
