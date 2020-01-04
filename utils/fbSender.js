const axios = require('axios').default;
const queue = _rq('services/Queue');

let api = 'https://graph.facebook.com/v5.0';

module.exports = {
  config: {
    PAGE_ACCESS_TOKEN: '',
    SERVER_URL: process.env.HOST || 'localhost:' + process.env.PORT,
    VERSION: 'v5.0'
  },
  api,
  /**
   *
   * @param {*} config PAGE_ACCESS_TOKEN, SERVER_URL
   */
  init(config) {
    this.config = { ...this.config, ...config };
    this.api = 'https://graph.facebook.com/' + this.config.VERSION;
    return { ...this };
  },

  /**
   *
   * @param {object} sender
   * @param {string} message text you want send
   */
  sendTextMessage(sender, message) {
    const data = {
      recipient: {
        id: sender.id
      },
      message: {
        text: message
      }
    };
    const url = this.api + '/me/messages';
    const params = {
      access_token: this.config.PAGE_ACCESS_TOKEN
    };
    let a = queue.create('postfacebookapi', { url, data, params }).save();
  },

  /**
   *
   * @param {Object} sender
   */
  sendTypingOn(sender) {
    var data = {
      recipient: {
        id: sender.id
      },
      sender_action: 'typing_on'
    };
    const url = this.api + '/me/messages';
    const params = {
      access_token: this.config.PAGE_ACCESS_TOKEN
    };
    queue.create('postfacebookapi', { url, data, params }).save();
  },
  /**
   *
   * @param {Object} sender
   */
  sendTypingOff(sender) {
    var data = {
      recipient: {
        id: sender.id
      },
      sender_action: 'typing_off'
    };
    const url = this.api + '/me/messages';
    const params = {
      access_token: this.config.PAGE_ACCESS_TOKEN
    };
    queue.create('postfacebookapi', { url, data, params }).save();
  },
  /**
   *
   * @param {*} id facebook userid
   */
  getUserInfo(id) {
    const url = this.api + '/' + id;
    const params = {
      fields: 'id,name,profile_pic',
      access_token: this.config.PAGE_ACCESS_TOKEN
    };
    return axios.get(url, { params });
  },
  /**
   *
   * @param {string} access_token page access_token
   * @param {string} senderId
   * @param {*} payload message data
   * @returns {Promise<any>}
   */
  sendMessage(access_token, senderId, message) {
    const data = {
      recipient: {
        id: senderId
      },
      message
    };
    const url = api + '/me/messages';
    const params = {
      access_token
    };
    return new Promise((resolve, reject) => {
      axios
        .post(url, data, { params })
        .then(res => {
          resolve({ senderId, success: true });
        })
        .catch(error => {
          resolve({ senderId, success: false, error });
        });
    });
  }
};
