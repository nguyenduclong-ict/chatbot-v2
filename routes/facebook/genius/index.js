const router = require('express').Router();
/** @type {SocketIO.Server} */
const io = require(`${__dirroot}/services/Socket.IO`);
const APP_NAME = 'genius';
const { VERIFY_TOKEN, APP_SECRET, SERVER_URL } = _.get(
  require(`${__dirroot}/config`),
  ['facebook', APP_NAME],
  {}
);
const queue = require(`${__dirroot}/utils/queue`);
const fbSender = require(`${__dirroot}/utils/fbSender`);

/**
 * Routes
 */

router.post('/webhook', handleReciveEvent);
router.get('/webhook', handleWeehookVerify);

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

/**
 * Recived Event
 * @param {Request} req
 * @param {Response<any>} res
 * @param {NextFunction} next
 */

function handleReciveEvent(req, res, next) {
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
      // const pageInfo =
      _log(pageEntry);
      // pageEntry.messaging.forEach(message => {
      //   console.log(message);
      // });
    });
  }
}

// Accepts GET requests at the /webhook endpoint

/**
 *
 * @param {express.request} req
 * @param {express.response} res
 */

function handleWeehookVerify(req, res) {
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
}

module.exports = router;
