const axios = require('axios').default;
const { getPage } = _rq('providers/PageProvider');
const { getBlock } = _rq('providers/BlockProvider');
const { socketio } = _rq('services/Socket.IO.js');
const { graphUrl } = _rq('config').facebook;
const { makeMessage } = require('../utils/facebook');
const { updateManyCustomer, getManyCustomer, updateCustomer } = _rq(
  'providers/CustomerProvider'
);

// API
const API_VERSION = 'v5.0';
const endpoint = 'https://graph.facebook.com/' + API_VERSION;

async function testFlow(flow_id, senderId, user_id, page_id) {
  // get start block
  try {
    const [page, startBlock] = await Promise.all([
      getPage({ user_id, id: page_id }),
      getBlock({ flow_id, is_start: true })
    ]);
    if (!startBlock) throw 'Not found StartBlock in flow ' + flow_id;
    let rs;
    if (startBlock.type === 'message') {
      rs = await sendMessageBlock(startBlock, [senderId], page.access_token);
    } else if (startBlock.type === 'action') {
      rs = await sendActionBlock(startBlock, [senderId], page.access_token);
    }
    _log(JSON.stringify(rs, null, 2));
    socketio()
      .to(page._id)
      .emit('notify', {
        type: 'success',
        action: 'test-flow',
        title: 'Thành công',
        message: 'Gửi thử kịch bản thành công!'
      });
    return rs;
  } catch (error) {
    _log('aaa', error);
    const page = await getPage({ user_id, id: page_id });
    if (page)
      socketio()
        .to(page._id)
        .emit('notify', {
          type: 'error',
          action: 'test-flow',
          title: 'Thử kịch bản thất bại!',
          message: [error.message, error.error || '']
            .filter(e => !!e)
            .join(' - ')
        });
    return error;
  }
}

async function sendFlow(flow_id, senderIds, user_id, page_id) {
  if (!Array.isArray(senderIds)) senderIds = [senderIds];
  // get start block
  const [page, startBlock] = await Promise.all([
    getPage({ user_id, id: page_id }),
    getBlock({ flow_id, is_start: true })
  ]);
  if (!startBlock) throw 'Not found StartBlock in flow ' + flow_id;

  if (startBlock.type === 'message') {
    return sendMessageBlock(startBlock, senderIds, page.access_token);
  } else if (startBlock.type === 'action') {
    return sendActionBlock(startBlock, senderIds, page.access_token);
  }
}

/**
 *
 * @param {object} block Block muốn gửi
 * @param {[string]} senderIds Mảng id người nhận
 * @param {string} access_token page access token
 * @param {[any]} pre above block sended
 */
async function sendMessageBlock(
  block,
  senderIds = [],
  access_token = '',
  pre = []
) {
  _log(block, pre);
  if (pre.length > 30) {
    return { success: true, message: 'stop with deep >= 30' };
  } else {
    pre.push(block._id);
  }
  try {
    // get block data if block is objectId
    const messages = block.content.cards.map(makeMessage);
    const tasks = [];

    senderIds.forEach(senderId => {
      tasks.push(
        messages.reduce((promiseChain, message) => {
          return promiseChain.then(chainResults => {
            if (message.type === 'delay') {
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve('Delay ' + message.wait * 1000 + ' miliseconds');
                }, message.wait * 1000);
              }).then(result => [...chainResults, result]);
            } else {
              return sendMessage(
                senderId,
                message,
                access_token
              ).then(result => [...chainResults, result]);
            }
          });
        }, Promise.resolve([]))
      );
    });

    result = await Promise.all(tasks);

    // send next block
    if (block.has_next_block && block.next_block_id) {
      // get promise for Asynchronous
      getBlock({ _id: block.next_block_id }).then(nextBlock => {
        if (!nextBlock) _log('Next block not found');
        if (pre.find(bId => bId.toString() === nextBlock._id.toString())) {
          _log('Recursive block => stop at ' + nextBlock._id, '%warning%');
          return {
            success: true,
            message: 'Recursive block => stop at ' + nextBlock._id
          };
        }
        switch (nextBlock.type) {
          case 'message':
            sendMessageBlock(nextBlock, senderIds, access_token, pre);
            break;
          case 'action':
            sendActionBlock(nextBlock, senderIds, access_token, pre);
            break;
          default:
            break;
        }
      });
    }
    return { success: true, result, message: 'Send Block message success' };
  } catch (error) {
    throw _createError('Send Block message error', 500, {
      success: false,
      error
    });
  }
}

/**
 *
 * @param {object} block Block muốn gửi
 * @param {[string]} senderIds Mảng id người nhận
 * @param {string} access_token page access token
 * @param {[any]} pre above block sended
 */
async function sendActionBlock(
  block,
  senderIds = [],
  access_token = '',
  pre = []
) {
  if (pre.length > 30) {
    return { success: true, message: 'stop with deep >= 30' };
  } else {
    pre.push(block._id);
  }
  try {
    // get block data if block is objectId
    const tasks = [];
    block.content.actions.forEach(action => {
      switch (action.type) {
        case 'add-tag':
          tasks.push(
            updateManyCustomer(
              {
                id: { $in: senderIds },
                user_id: block.user_id
              },
              {
                $addToSet: {
                  tags: {
                    $each: action.tags
                  }
                }
              }
            )
          );
          break;
        case 'remove-tag':
          tasks.push(
            updateManyCustomer(
              {
                id: { $in: senderIds },
                user_id: block.user_id
              },
              {
                $pull: {
                  tags: {
                    $in: action.tags
                  }
                }
              }
            )
          );
          break;
        case 'subscribe':
          tasks.push(
            updateManyCustomer(
              {
                id: { $in: senderIds },
                user_id: block.user_id
              },
              {
                is_subscribe: true
              }
            )
          );
          break;
        case 'un-subscribe':
          tasks.push(
            updateCustomer(
              {
                id: senderIds[0]
              },
              {
                is_subscribe: false
              }
            )
          );
          break;
        default:
          break;
      }
    });
    result = await Promise.all(tasks);
    // send next block
    if (block.has_next_block && block.next_block_id) {
      // get promise for Asynchronous
      getBlock({ _id: block.next_block_id }).then(nextBlock => {
        if (!nextBlock) _log('Next block not found');
        if (pre.find(bId => bId.toString() === nextBlock._id.toString())) {
          _log('Recursive block => stop at ' + nextBlock._id, '%warning%');
          return {
            success: true,
            message: 'Recursive block => stop at ' + nextBlock._id
          };
        }
        switch (nextBlock.type) {
          case 'message':
            sendMessageBlock(nextBlock, senderIds, access_token, pre);
            break;
          case 'action':
            sendActionBlock(nextBlock, senderIds, access_token, pre);
            break;
          default:
            break;
        }
      });
    }
    return { success: true, result, message: 'Send Block Action success' };
  } catch (error) {
    throw _createError('Send Block action error', 500, {
      success: false,
      error
    });
  }
}

/**
 * Send message to user
 * @param {*} senderId id of user
 * @param {*} message message data build valid
 * @param {*} access_token page access token
 * @param {number} wait page access token
 */
async function sendMessage(senderId, message, access_token, wait) {
  return new Promise(async (resolve, reject) => {
    sendTypingOn(senderId, access_token);
    try {
      const data = {
        recipient: {
          id: senderId
        },
        message
      };
      if (wait) {
        setTimeout(async () => {
          await axios.post(endpoint + '/me/messages', data, {
            params: {
              access_token
            }
          });
          resolve('Send success to ' + senderId);
        }, wait);
      } else {
        await axios.post(endpoint + '/me/messages', data, {
          params: {
            access_token
          }
        });
        resolve('Send success to ' + senderId);
      }
    } catch (error) {
      resolve({ error: true, data: { error } });
    }
  });
}

/**
 *
 * @param {String} senderId
 */
function sendTypingOn(senderId, access_token) {
  axios.post(
    endpoint + '/me/messages',
    {
      recipient: {
        id: senderId
      },
      sender_action: 'typing_on'
    },
    {
      params: {
        access_token
      }
    }
  );
}

/**
 *
 * @param {String} senderId
 */
function sendTypingOff(senderId, access_token) {
  axios.post(
    endpoint + '/me/messages',
    {
      recipient: {
        id: senderId
      },
      sender_action: 'typing_off'
    },
    {
      params: {
        access_token
      }
    }
  );
}

async function getUserInfo(
  userId,
  access_token,
  { userFields, accountsFields } = {}
) {
  try {
    userFields = userFields || 'name,email,picture';
    accountsFields = accountsFields || 'name,picture,access_token,link';
    const endPoint = graphUrl + '/' + userId;
    const endPoint2 = graphUrl + '/' + userId + '/accounts';

    const tasks = [];

    tasks.push(
      axios.get(endPoint, {
        params: { access_token, fields: userFields, limit: 1000 }
      })
    );

    tasks.push(
      axios.get(endPoint2, {
        params: { access_token, fields: accountsFields, limit: 1000 }
      })
    );

    const [me, accounts] = await Promise.all(tasks);
    return { ...me.data, accounts: accounts.data.data };
  } catch (error) {
    _log('Get User Info fail ', error.message);
    return null;
  }
}

async function getLongLiveToken(shortToken, APP_ID, APP_SECRET) {
  try {
    const endPoint = `${graphUrl}/oauth/access_token`;
    const params = {
      grant_type: 'fb_exchange_token',
      client_id: APP_ID, // app_id
      client_secret: APP_SECRET, // app_secret
      fb_exchange_token: shortToken // short token
    };
    const response = await axios.get(endPoint, { params });
    return response.data;
  } catch (error) {
    _log('Get long live token error ', error.message);
    return null;
  }
}

async function subscribeApp(pageId, access_token, subscribed_fields) {
  const endPoint = graphUrl + '/' + pageId + '/subscribed_apps';
  try {
    subscribed_fields = subscribed_fields || [
      'feed',
      'messages',
      'conversations',
      'messaging_optins',
      'messaging_postbacks'
    ];
    const response = await axios.post(
      endPoint,
      { subscribed_fields },
      { params: { access_token } }
    );
    return { ...response.data, subscribed_fields };
  } catch (error) {
    _log('Subscribed App Error ', error.message, { error }, '%error%');
    throw _createError(
      'Lỗi trong khi kích hoạt page. Bạn có thể cấp lại quyền cho app và thử lại!'
    );
  }
}

async function unSubscriedApp(pageId, access_token) {
  const endPoint = graphUrl + '/' + pageId + '/subscribed_apps';
  try {
    const response = await axios.delete(endPoint, { params: { access_token } });
    return { ...response.data };
  } catch (error) {
    _log('UnSubscribed App Error ', pageId, { error });
    return null;
  }
}

/**
 * Sync messenger profile
 */
async function updateMessagerProfile(pageId, access_token, settings) {
  const endpoint = graphUrl + '/' + pageId + '/messenger_profile';
  _log(settings);
  try {
    return (await axios.post(endpoint, settings, { params: { access_token } }))
      .data;
  } catch (error) {
    _log('Update Messenger Profile setting App Error ', error.response.data);
    return null;
  }
}

/**
 * menu : persitent_menu, get_started, greeting
 */
async function deleteMessengerProfile(pageId, access_token, fields) {
  const endpoint = graphUrl + '/' + pageId + '/messenger_profile';
  _log(endpoint, { params: { access_token, fields } });
  try {
    return (await axios.delete(endpoint, { params: { access_token, fields } }))
      .data;
  } catch (error) {
    // _log('Delete Messenger Profile setting Error ', error);
    return { error: true, data: error };
  }
}

module.exports = {
  getLongLiveToken,
  subscribeApp,
  unSubscriedApp,
  updateMessagerProfile,
  deleteMessengerProfile,
  getUserInfo,
  sendFlow,
  testFlow,
  sendMessage,
  sendMessageBlock,
  sendActionBlock
};
