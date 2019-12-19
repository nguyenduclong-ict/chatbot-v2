const config = _get(
  require(__dirroot + '/config'),
  'facebook/genius/pages/genius_x'
);
const { PAGE_ACCESS_TOKEN, PAGE_ID } = config;

const facebookMessage = require(__dirroot + '/utils/facebookMessage');
const Sender = facebookMessage.init({
  PAGE_ACCESS_TOKEN
});

function handleMessage(event) {
  const { message, sender } = event;
  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  // replies
  if (messageText) {
    Sender.sendTextMessage(sender, messageText);
  }
}

module.exports = { PAGE_ACCESS_TOKEN, PAGE_ID, handleMessage };
