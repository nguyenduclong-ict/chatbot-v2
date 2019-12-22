const router = require('express').Router();
router.middlewares = ['get-user-info'];
const { get } = require('lodash');
const APP_NAME = 'genius';
const { VERIFY_TOKEN, APP_SECRET, SERVER_URL } = _get(
  require(__dirroot + '/config'),
  'facebook/' + APP_NAME
);
const moment = require('moment');
const { updateUser } = require(__dirroot + '/models/User');
const Page = require(__dirroot + '/models/Page');
const { listPageOfUser, updatePage } = require(__dirroot +
  '/providers/PageProvider');
const {
  getUserInfo,
  getLongLiveToken,
  subscribeApp
} = require('../../../utils/fb');

// defined route
router.post('/add-page', postAddPage);
router.post('/active-page', postActivePage);

// functions
async function postAddPage(req, res) {
  try {
    let result;
    const { accessToken, userID } = req.body;

    // get long live token
    result = await getLongLiveToken(APP_NAME, accessToken);
    let { access_token, expires_in } = result;
    expires_in = expires_in || 60 * 24 * 60 * 60;
    const expires_at = moment()
      .add(expires_in, 'seconds')
      .toDate();

    // using long live token get user info and list page
    const data = await getUserInfo(userID, access_token);
    _log(data);
    const { email, name, id } = data;
    const picture = get(data, 'picture.data.url', '');
    const fbAccount = {
      email,
      name,
      id,
      picture,
      token: access_token,
      token_expired: expires_at
    };

    // save user to userinfo
    await updateUser(req.user._id, {
      facebook_accounts: [fbAccount],
      name: 'Nguyễn Đức Long'
    });

    // save list page to database
    const list = get(data, ['accounts', 'data'], []);
    const task = list.map(e => {
      const pageData = {
        ...e,
        picture: get(e, 'picture.data.url', ''),
        user_id: req.user._id,
        user_facebook_id: id,
        type: 'facebook',
        token_expired: expires_at
      };
      return updatePage(
        { id: pageData.id, user_id: req.user._id },
        pageData,
        true
      );
    });

    await Promise.all(task);
    const litsPage = await listPageOfUser(req.user._id);
    return res.json(litsPage);
  } catch (error) {
    console.log(error);
    return Error.createError(error.message, 500);
  }
}

async function postActivePage(req, res) {
  try {
    const { page_id, subscribed_fields } = req.body;
    const page = await Page.findOne({ id: page_id, user_id: req.user._id });
    if (page) {
      const result = await subscribeApp(
        page_id,
        page.access_token,
        subscribed_fields
      );
      if (result.success) {
        await updatePage(
          { id: page_id, user_id: req.user._id },
          { ...page.toObject(), subscribed_fields: result.subscribed_fields }
        );
        return res.json(result);
      } else {
        throw 'Xảy ra lỗi';
      }
    } else {
      return Error.createError('Không tìm thấy Page', 404);
    }
  } catch (error) {
    _log(error);
    return Error.createError(error.message || 'Xảy ra lỗi', error.code || 500);
  }
}

module.exports = router;
