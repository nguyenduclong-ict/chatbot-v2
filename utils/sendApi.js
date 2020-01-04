const { clean } = require('express-extra-tool').functions;
const validator = require('validator').default;
const axios = require('axios').default;

// API
const API_VERSION = 'v5.0';
const endpoint = 'https://graph.facebook.com/' + API_VERSION;

async function sendTestFlow(flow_id, senderId) {}

async function sendBlock(block, senderId, access_token) {
  let result = 'Không có tin nào đc gửi';
  const task = [];
  if (block.type === 'message') {
    const { cards, conditions, actions } = block.content;
    if (cards) {
      task.push(
        ...cards.map(card =>
          sendMessage(card.type, card, senderId, access_token)
        )
      );
    }
  }
  result = await Promise.all(task);
  return result;
}
module.exports.sendBlock = sendBlock;

async function sendMessage(type, card, senderId, access_token) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = {
        recipient: {
          id: senderId
        }
      };
      if (type === 'button' && card.buttons.length === 0) type = 'text';
      switch (type) {
        case 'button':
          data.message = makeButtonMessage(card);
          break;
        case 'text':
          data.message = makeTextMessage(card);
        default:
          break;
      }

      await axios.post(endpoint + '/me/messages', data, {
        params: {
          access_token
        }
      });
      resolve('Send success to ' + senderId);
    } catch (error) {
      console.log({ error });
      resolve({ error: true, data: { error } });
    }
  });
}
module.exports.sendMessage = sendMessage;

function makeTextMessage({ text }) {
  if (!text) throw 'Text message required text field';
  return {
    text
  };
}

function makeButtonMessage({ text, buttons }) {
  if (!validateButtons(buttons)) throw 'Button invalidate text field';
  if (!text) throw 'Text message required text field';

  const template = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: text,
        buttons: buttons.map(button => {
          if (button.type === 'web_url') {
            return _.pick(button, [
              'title',
              'url',
              'type',
              'webview_height_ratio'
            ]);
          }

          if (button.type === 'postback' || button.type === 'phone_number') {
            return _.pick(button, ['title', 'payload', 'type']);
          }
        })
      }
    }
  };
  return template;
}

module.exports.makeButtonMessage = makeButtonMessage;

/**
 *
 * @param {array} buttons
 */
function validateButtons(buttons) {
  if (buttons.length === 0) return false;
  return buttons.every(button => {
    if (button.type === 'web_url') {
      return [
        !!button.title,
        validator.isURL(button.url),
        ['compact', 'tall', 'full'].includes(button.webview_height_ratio)
      ].every(e => e);
    }

    if (button.type === 'postback') {
      return [!!button.title, !!button.payload].every(e => e);
    }

    if (button.type === 'phone_number') {
      return [!!button.title, validator.isMobilePhone(button.payload)].every(
        e => e
      );
    }
  });
}

module.exports.validateButtons = validateButtons;
