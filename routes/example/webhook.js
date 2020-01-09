const router = require('express').Router();
var request = require('request');
const { getTestPage } = _rq('/providers/Example/TestPageProvider');
const { getApp } = _rq('/providers/Example/AppProvider');

/*
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
 */
router.get('/', async function(req, res, next) {
  const page = await getTestPage(
    { page_id: req.params.id || '104374497763853' },
    ['app_id']
  );
  const app = page.app_id;
  if (!app) return res.sendStatus(403);
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === app.verify_token
  ) {
    _log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
router.post('/', function(req, res) {
  // Assume all went well.
  //
  // You must send back a 200, within 20 seconds, to let us know you've
  // successfully received the callback. Otherwise, the request will time out.
  res.sendStatus(200);

  var data = req.body;
  _log(data);
  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(async function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      const page = await getTestPage({ page_id: pageID }, ['app_id']);
      if (!page) return;
      const accessToken = page.page_access_token;
      const serverUrl = page.app_id.server_url;
      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent, accessToken);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent, accessToken, serverUrl);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent, accessToken);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent, accessToken);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent, accessToken);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent, accessToken);
        } else {
          _log('Webhook received unknown messagingEvent: ', messagingEvent);
        }
      });
    });
  }
});

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL.
 *
 */
router.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will
  // be passed to the Account Linking callback.
  var authCode = '1234567890';

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + '&authorization_code=' + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf, appSecret) {
  var signature = req.headers['x-hub-signature'];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto
      .createHmac('sha1', appSecret)
      .update(buf)
      .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event, accessToken) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  var passThroughParam = event.optin.ref;

  _log(
    'Received authentication for user %d and page %d with pass ' +
      "through param '%s' at %d",
    senderID,
    recipientID,
    passThroughParam,
    timeOfAuth
  );

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, 'Authentication successful', accessToken);
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've
 * created. If we receive a message with an attachment (image, video, audio),
 * then we'll simply confirm that we've received the attachment.
 *
 */
function receivedMessage(event, accessToken, serverUrl) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  _log(
    'Received message for user %d and page %d at %d with message:',
    senderID,
    recipientID,
    timeOfMessage
  );
  _log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    _log(
      'Received echo for message %s and app %d with metadata %s',
      messageId,
      appId,
      metadata
    );
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    _log(
      'Quick reply for message %s with payload %s',
      messageId,
      quickReplyPayload
    );

    sendTextMessage(senderID, 'Quick reply tapped', accessToken);
    return;
  }

  if (messageText) {
    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (
      messageText
        .replace(/[^\w\s]/gi, '')
        .trim()
        .toLowerCase()
    ) {
      case 'hello':
      case 'hi':
        sendHiMessage(senderID, accessToken);
        break;

      case 'image':
        requiresServerURL(sendImageMessage, [senderID, accessToken, serverUrl]);
        break;

      case 'gif':
        requiresServerURL(sendGifMessage, [senderID, accessToken, serverUrl]);
        break;

      case 'audio':
        requiresServerURL(sendAudioMessage, [senderID, accessToken, serverUrl]);
        break;

      case 'video':
        requiresServerURL(sendVideoMessage, [senderID, accessToken, serverUrl]);
        break;

      case 'file':
        requiresServerURL(sendFileMessage, [senderID, accessToken, serverUrl]);
        break;

      case 'button':
        sendButtonMessage(senderID, accessToken);
        break;

      case 'generic':
        requiresServerURL(sendGenericMessage, [
          senderID,
          accessToken,
          serverUrl
        ]);
        break;

      case 'receipt':
        requiresServerURL(sendReceiptMessage, [
          senderID,
          accessToken,
          serverUrl
        ]);
        break;

      case 'quick reply':
        sendQuickReply(senderID, accessToken);
        break;

      case 'read receipt':
        sendReadReceipt(senderID, accessToken);
        break;

      case 'typing on':
        sendTypingOn(senderID, accessToken);
        break;

      case 'typing off':
        sendTypingOff(senderID, accessToken);
        break;

      case 'account linking':
        requiresServerURL(sendAccountLinking, [senderID, serverUrl]);
        break;
      case 'info':
        sendTextMessage(
          senderID,
          `I'm Bot of Long' Master. I can help me contact with Master`,
          accessToken
        );
        break;
      default:
        sendTextMessage(senderID, messageText, accessToken);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received', accessToken);
  }
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      _log('Received delivery confirmation for message ID: %s', messageID);
    });
  }

  _log('All message before %d were delivered.', watermark);
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
function receivedPostback(event, accessToken) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log(
    "Received postback for user %d and page %d with payload '%s' " + 'at %d',
    senderID,
    recipientID,
    payload,
    timeOfPostback
  );

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  sendTextMessage(senderID, 'Postback called', accessToken);
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  _log(
    'Received message read event for watermark %d and sequence ' + 'number %d',
    watermark,
    sequenceNumber
  );
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  _log(
    'Received account link event with for user %d with status %s ' +
      'and auth code %s ',
    senderID,
    status,
    authCode
  );
}

/*
 * If users came here through testdrive, they need to configure the server URL
 * in default.json before they can access local resources likes images/videos.
 */
function requiresServerURL(next, [recipientId, accessToken, ...args]) {
  next.apply(this, [recipientId, accessToken, ...args]);
}

function sendHiMessage(recipientId, accessToken) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: `
          Hello I'm Bot. You can try out :
            "quick reply", "receipt", 
            "typing on", "typing off", 
            "button", 
            "video", 
            "generic", "hi", 
            "Hello", "info", or "image" 
          command.
        `
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId, accessToken, serverUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'image',
        payload: {
          url: serverUrl + '/assets/rift.png'
        }
      }
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId, accessToken, serverUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'image',
        payload: {
          url: serverUrl + '/assets/instagram_logo.gif'
        }
      }
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId, accessToken, serverUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'audio',
        payload: {
          url: serverUrl + '/assets/sample.mp3'
        }
      }
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId, accessToken, serverUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'video',
        payload: {
          url: serverUrl + '/assets/allofus480.mov'
        }
      }
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId, accessToken, serverUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'file',
        payload: {
          url: serverUrl + '/assets/test.txt'
        }
      }
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText, accessToken) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: 'DEVELOPER_DEFINED_METADATA'
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId, accessToken) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'This is test text',
          buttons: [
            {
              type: 'web_url',
              url: 'https://www.oculus.com/en-us/rift/',
              title: 'Open Web URL'
            },
            {
              type: 'postback',
              title: 'Trigger Postback',
              payload: 'DEVELOPER_DEFINED_PAYLOAD'
            },
            {
              type: 'phone_number',
              title: 'Call Phone Number',
              payload: '+16505551234'
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId, accessToken, serverUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'rift',
              subtitle: 'Next-generation virtual reality',
              item_url: 'https://www.oculus.com/en-us/rift/',
              image_url: serverUrl + '/assets/rift.png',
              buttons: [
                {
                  type: 'web_url',
                  url: 'https://www.oculus.com/en-us/rift/',
                  title: 'Open Web URL'
                },
                {
                  type: 'postback',
                  title: 'Call Postback',
                  payload: 'Payload for first bubble'
                }
              ]
            },
            {
              title: 'touch',
              subtitle: 'Your Hands, Now in VR',
              item_url: 'https://www.oculus.com/en-us/touch/',
              image_url: serverUrl + '/assets/touch.png',
              buttons: [
                {
                  type: 'web_url',
                  url: 'https://www.oculus.com/en-us/touch/',
                  title: 'Open Web URL'
                },
                {
                  type: 'postback',
                  title: 'Call Postback',
                  payload: 'Payload for second bubble'
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId, accessToken) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = 'order' + Math.floor(Math.random() * 1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'receipt',
          recipient_name: 'Peter Chang',
          order_number: receiptId,
          currency: 'USD',
          payment_method: 'Visa 1234',
          timestamp: '1428444852',
          elements: [
            {
              title: 'Oculus Rift',
              subtitle: 'Includes: headset, sensor, remote',
              quantity: 1,
              price: 599.0,
              currency: 'USD',
              image_url: serverUrl + '/assets/riftsq.png'
            },
            {
              title: 'Samsung Gear VR',
              subtitle: 'Frost White',
              quantity: 1,
              price: 99.99,
              currency: 'USD',
              image_url: serverUrl + '/assets/gearvrsq.png'
            }
          ],
          address: {
            street_1: '1 Hacker Way',
            street_2: '',
            city: 'Menlo Park',
            postal_code: '94025',
            state: 'CA',
            country: 'US'
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.0,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [
            {
              name: 'New Customer Discount',
              amount: -50
            },
            {
              name: '$100 Off Coupon',
              amount: -100
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId, accessToken) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          content_type: 'text',
          title: 'Action',
          payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION'
        },
        {
          content_type: 'text',
          title: 'Comedy',
          payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY'
        },
        {
          content_type: 'text',
          title: 'Drama',
          payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA'
        }
      ]
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId, accessToken) {
  _log('Sending a read receipt to mark message as seen');

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'mark_seen'
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId, accessToken) {
  _log('Turning typing indicator on');

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_on'
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId, accessToken) {
  _log('Turning typing indicator off');

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_off'
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId, serverUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'Welcome. Link your account.',
          buttons: [
            {
              type: 'account_link',
              url: serverUrl + '/authorize'
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData, accessToken);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData, accessToken) {
  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: accessToken },
      method: 'POST',
      json: messageData
    },
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;

        if (messageId) {
          _log(
            'Successfully sent message with id %s to recipient %s',
            messageId,
            recipientId
          );
        } else {
          _log('Successfully called Send API for recipient %s', recipientId);
        }
      } else {
        console.error(
          'Failed calling Send API',
          response.statusCode,
          response.statusMessage,
          body.error
        );
      }
    }
  );
}

module.exports = router;
