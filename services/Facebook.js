const { clean } = require('express-extra-tool').functions;
const validator = require('validator').default;
const axios = require('axios').default;
const { getPage } = _rq('providers/PageProvider');
const { getBlock } = _rq('providers/BlockProvider');
const { socketio } = _rq('services/Socket.IO.js');

// API
const API_VERSION = 'v5.0';
const endpoint = 'https://graph.facebook.com/' + API_VERSION;

async function testFlow(flow_id, senderId, user_id, page_id) {
  // get start block
  const [page, startBlock] = await Promise.all([
    getPage({ user_id, id: page_id }),
    getBlock({ flow_id, is_start: true })
  ]);

  const rs = await sendBlock(startBlock, [senderId], page.access_token);
  _log(rs);
  socketio()
    .to(page._id)
    .emit('notify', {
      type: 'success',
      action: 'test-flow',
      message: 'Gửi tin nhắn test thành công!'
    });
}

/**
 *
 * @param {object} block Block muốn gửi
 * @param {[string]} senderIds Mảng id người nhận
 * @param {string} access_token page access token
 */
async function sendBlock(block, senderIds, access_token) {
  if (!block._id) {
    block = await getBlock({ _id: block });
  }
  if (!block) return 'Không tìm thấy block ';
  let result = 'Không có tin nào đc gửi';
  const tasks = [];
  senderIds.forEach(senderId => {
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
    tasks.push(Promise.all(task));
  });
  result = await Promise.all(tasks);

  // send next block if have
  if (block.has_next_block && block.next_block_id) {
    sendBlock(block.next_block_id.toString(), senderIds, access_token);
  }
  return result;
}

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

/**
 *
 * @param {array} buttons
 */
function validateButtons(buttons) {
  if (buttons.length === 0) return false;
  _log(buttons);
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

module.exports = {
  makeButtonMessage,
  validateButtons,
  testFlow,
  sendMessage,
  sendBlock
};
