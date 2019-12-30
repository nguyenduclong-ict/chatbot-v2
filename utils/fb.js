const axios = require('axios').default;
const config = require('../config/index');
const { graphUrl } = config.facebook;

module.exports.getUserInfo = async function(
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
};

module.exports.getLongLiveToken = async function(appName, shortToken) {
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
};

module.exports.subscribeApp = async function(
  pageId,
  access_token,
  subscribed_fields
) {
  const endPoint = graphUrl + '/' + pageId + '/subscribed_apps';
  try {
    subscribed_fields = subscribed_fields || [
      'feed',
      'messages',
      'conversations'
    ];
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
};

module.exports.unSubscriedApp = async function(pageId, access_token) {
  const endPoint = graphUrl + '/' + pageId + '/subscribed_apps';
  try {
    const response = await axios.delete(endPoint, { params: { access_token } });
    return { ...response.data };
  } catch (error) {
    _log('UnSubscribed App Error ', error.message);
    return null;
  }
};

/**
 * Sync messenger profile
 */
module.exports.updateMessagerProfile = async function(
  pageId,
  access_token,
  settings
) {
  const endpoint = graphUrl + '/' + pageId + '/messenger_profile';
  _log(settings);
  try {
    return (await axios.post(endpoint, settings, { params: { access_token } }))
      .data;
  } catch (error) {
    _log('Update Messenger Profile setting App Error ', error);
    return null;
  }
};

/**
 * menu : persitent_menu, get_started, greeting
 */
module.exports.deleteMessengerProfile = async function(
  pageId,
  access_token,
  fields
) {
  const endpoint = graphUrl + '/' + pageId + '/messenger_profile';
  try {
    return (
      await axios.delete(endpoint, {}, { params: { access_token, fields } })
    ).data;
  } catch (error) {
    _log('Delete Messenger Profile setting Error ', error);
    return null;
  }
};
