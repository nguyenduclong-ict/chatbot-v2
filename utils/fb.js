const axios = require('axios').default;
const graphUrl = 'https://graph.facebook.com/v5.0';
const config = require('../config/index');

async function getUserInfo(userId, access_token, fields) {
  try {
    fields =
      fields || 'name,accounts{access_token,name,picture{url}},email,picture';
    // const endPoint = graphUrl + '/' + userId;
    const endPoint = graphUrl + '/' + userId;
    const response = await axios.get(endPoint, {
      params: { access_token, fields, limit: 1000 }
    });
    return response.data;
  } catch (error) {
    _log('Get User Info fail ', error.message);
    return null;
  }
}

async function getLongLiveToken(appName, shortToken) {
  try {
    const { APP_ID, APP_SECRET } = config.facebook[appName];
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
    subscribed_fields = subscribed_fields || ['feed', 'messages'];
    const response = await axios.post(
      endPoint,
      { subscribed_fields },
      { params: { access_token } }
    );
    return { ...response.data, subscribed_fields };
  } catch (error) {
    _log('Subscribed App Error ', error.message);
    return null;
  }
}

module.exports = { getUserInfo, getLongLiveToken, subscribeApp };
