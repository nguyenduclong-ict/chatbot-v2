const router = require('express').Router();
const { get } = require('lodash');
const { socketio } = _rq('services/Socket.IO.js');

const APP_NAME = 'drize';
const config = _rq('/config');
const { APP_ID, APP_SECRET } = get(config, ['facebook', APP_NAME]);

const moment = require('moment');
const { updateUser } = _rq('/providers/UserProvider');
const Page = _rq('/models/Page');
const { updatePage, updateManyPage } = _rq('/providers/PageProvider');
const { getUserInfo, getLongLiveToken, subscribeApp, unSubscriedApp } = _rq(
  '/services/Facebook'
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
    // short access token
    const { accessToken, userID } = req.body;
    // get long live token
    result = await getLongLiveToken(accessToken, APP_ID, APP_SECRET);
    if (!result) throw _createError('Error when get long page access token'); // Lỗi khi get long access token
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
    socketio()
      .to(req.user._id)
      .emit('notify', {
        type: 'success',
        action: 'add-page',
        title: 'Thành công',
        message:
          'Thêm page thành công, bạn có thể chọn kích hoạt page để bắt đầu sử dụng'
      });
  } catch (error) {
    console.log(error);
    socketio()
      .to(req.user._id)
      .emit('notify', {
        type: 'error',
        action: 'add-page',
        title: 'Thêm page thất bại!',
        message: [error.message, error.error || ''].filter(e => !!e).join(' - ')
      });
  }
}

async function postActivePage(req, res, next) {
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
      return next(_createError('Không tìm thấy Page', 404));
    }
  } catch (error) {
    _log(error);
    return next(_createError(error.message || 'Xảy ra lỗi', error.code || 500));
  }
}

async function postDeActivePage(req, res, next) {
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
      return next(_createError('Không tìm thấy Page', 404));
    }
  } catch (error) {
    _log(error);
    return next(_createError(error.message || 'Xảy ra lỗi', error.code || 500));
  }
}

// Export module
module.exports = router;
