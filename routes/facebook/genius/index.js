const router = require('express').Router();
const APP_NAME = 'genius';
const { VERIFY_TOKEN, APP_SECRET, SERVER_URL } = _.get(
  _rq('config'),
  ['facebook', APP_NAME],
  {}
);
const { parseQuery } = require('express-extra-tool').functions;
const { testFlow, sendBlock } = _rq('services/Facebook');

const { getPage } = _rq('providers/PageProvider');
const { getBlock } = _rq('providers/BlockProvider');

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

async function handleReciveEvent(req, res, next) {
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
      pageEntry.messaging.forEach(async message => {
        console.log(message);
        const senderId = message.sender.id;
        const pageId = message.recipient.id;
        // message send form plugin send to messenger
        if (message.optin) {
          const data = parseQuery(message.optin.ref, '+');
          if (data.action === 'test-flow') {
            console.log('handle test flow');
            const { flow_id, user_id } = data;
            testFlow(flow_id, senderId, user_id, pageId);
          }
        }

        // handle post back
        if (message.postback) {
          const data = parseQuery(message.postback.payload, '+');

          if (data.block) {
            // send next block
            const [block, page] = await Promise.all([
              getBlock({ _id: data.block }),
              getPage({ id: pageId, user_id: data.user_id })
            ]);
            if (block) sendBlock(block, [senderId], page.access_token);
          }
        }
      });
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

// Export module
module.exports = router;
