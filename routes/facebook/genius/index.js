const router = require('express').Router();
const APP_NAME = 'genius';
const { VERIFY_TOKEN, APP_SECRET, SERVER_URL } = _.get(
  _rq('config'),
  ['facebook', APP_NAME],
  {}
);
const { parseQuery } = require('express-extra-tool').functions;
const { testFlow, sendFlow, sendMessageBlock, sendActionBlock } = _rq(
  'services/Facebook'
);

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
  try {
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
            const payload = parseQuery(message.optin.ref, '+');
            if (payload.action === 'test-flow') {
              const { flow_id, user_id } = payload;
              testFlow(flow_id, senderId, user_id, pageId);
            }
          }

          // handle post back
          if (message.postback) {
            const payload = parseQuery(message.postback.payload, '+');
            if (payload.block) {
              // send next block
              const [block, page] = await Promise.all([
                getBlock({ _id: payload.block }),
                getPage({ id: pageId, user_id: payload.user_id })
              ]);
              if (!block) return; // no block found
              switch (block.type) {
                case 'message':
                  sendMessageBlock(
                    block,
                    [senderId],
                    page.access_token,
                    []
                  ).catch(e => _log(e, '%error%'));
                  break;
                case 'action':
                  sendActionBlock(
                    block,
                    [senderId],
                    page.access_token,
                    []
                  ).catch(e => _log(e, '%error%'));
                  break;
                default:
                  break;
              }
            } else if (payload.flow) {
              console.log(payload);
              // send flow
              const { flow, user_id } = payload;
              sendFlow(flow, senderId, user_id, pageId);
            }
          }
        });
      });
    }
  } catch (error) {
    _log(error, '%error%');
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
