const router = require('express').Router();
const { get } = require('lodash');
const APP_NAME = 'genius';

const moment = require('moment');
const { updateUser } = _rq('/models/User');
const Page = _rq('/models/Page');
const { updatePage, updateManyPage } = _rq('/providers/PageProvider');
const { getUserInfo, getLongLiveToken, subscribeApp, unSubscriedApp } = _rq(
  '/utils/fb'
);

// defind middleware for current route
router.middlewares = ['get-user-info'];

// defined route
router.post('/add-page', postAddPage);
router.post('/active-page', postActivePage);
router.post('/deactive-page', postDeActivePage);

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
      facebook_accounts: [fbAccount]
    });

    // save list page to database
    const list = get(data, ['accounts'], []);
    // update danh sách page được cấp quyền
    const tasks = list.map(e => {
      const pageData = {
        ...e,
        picture: get(e, 'picture.data.url', ''),
        user_id: req.user._id,
        user_facebook_id: id,
        type: 'facebook',
        token_expired: expires_at,
        hidden: false
      };
      return updatePage(
        { id: pageData.id, user_id: req.user._id },
        pageData,
        true
      );
    });
    // update lại danh sách page đã thêm nhưng không được cấp quyền
    tasks.push(
      updateManyPage(
        {
          id: { $nin: list.map(e => e.id) },
          user_id: req.user._id,
          user_facebook_id: id
        },
        { hidden: true, subscribed_fields: [] },
        false
      )
    );

    await Promise.all(tasks);
    return res.json({ success: true });
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
      // subscribed thành công
      if (result.success) {
        await updatePage(
          { id: page_id, user_id: req.user._id },
          {
            ...page.toObject(),
            subscribed_fields: result.subscribed_fields,
            is_active: true
          }
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

async function postDeActivePage(req, res) {
  try {
    const { page_id } = req.body;
    const page = await Page.findOne({ id: page_id, user_id: req.user._id });
    if (page) {
      const result = await unSubscriedApp(page_id, page.access_token);
      // unsubscribe thành công
      if (result.success) {
        await updatePage(
          { id: page_id, user_id: req.user._id },
          { ...page.toObject(), subscribed_fields: [], is_active: false }
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
