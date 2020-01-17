const kue = require('kue');
const axios = require('axios').default;
const { graphUrl } = require(__dirroot + '/config').facebook;
const Customer = require(__dirroot + '/models/Customer');
const { sendMessage } = require('../utils/fbSender');
// set options
const queue = kue.createQueue();
queue.setMaxListeners(1000 * 1000);
queue.on('error', function(err) {
  console.log('Oops... ', err);
});
// declare queue
queue.process('postfacebookapi', 20, postFacebookAPI);
queue.process('crawl-customer', 100, crawlCustomerFacebook);
queue.process('send-broadcast-message', 20, sendBroadcastMessage);

// Fuctions

function sendBroadcastMessage(job, done) {
  const task = [];
  const { access_token, message, senderIds } = job.data;
  senderIds.forEach(senderId => {
    task.push(sendMessage(access_token, senderId, message));
  });
  Promise.all(task).then(rs => {
    _log(rs);
  });
}

function postFacebookAPI(job, done) {
  const { url, data, params } = job.data;
  _log('sendMessage to ', { data });
  axios.post(url, data, { params }).then(() => {
    done();
  });
}

/**
 * Crawl customer facebook
 * @param {*} job
 * @param {*} done
 */
async function crawlCustomerFacebook(job, done) {
  // user_id : id of user in server
  const {
    user_id,
    page_id,
    page_id_facebook,
    access_token,
    url,
    limit
  } = job.data;
  _log('crawl customer', job.data);
  const endpoint = url || `${graphUrl}/${page_id_facebook}/conversations`;
  const options = url
    ? {}
    : {
        params: {
          limit,
          fields: 'senders,updated_time,link,can_reply,snippet',
          access_token
        }
      };
  const response = await axios.get(endpoint, options);
  const { data, paging } = response.data;
  updateCustomer(data, user_id, page_id, page_id_facebook);
  if (paging.next) {
    await crawlNextCustomer(
      paging.next,
      access_token,
      limit,
      page_id,
      user_id,
      page_id_facebook
    );
  } else {
    _log('Crawl customer success for page : ', page_id_facebook);
  }
  done();
}

async function crawlNextCustomer(
  url,
  access_token,
  limit,
  page_id,
  user_id,
  page_id_facebook
) {
  _log('crawl next customer ', url);
  const response = await axios.get(url);
  const { data, paging } = response.data;
  updateCustomer(data, user_id, page_id, page_id_facebook);
  if (paging.next) {
    await crawlNextCustomer(
      paging.next,
      access_token,
      limit,
      page_id,
      user_id,
      page_id_facebook
    );
  }
  return true;
}

// use for crawl customer
function updateCustomer(data, user_id, page_id, page_id_facebook) {
  // Save list user to database
  const tasks = [];
  data.map(function(conversation) {
    let customer =
      conversation.senders.data.find(
        sender => sender.id !== page_id_facebook
      ) || {};
    customer = {
      ...customer,
      type: 'facebook',
      can_reply: conversation.can_reply,
      snippet: conversation.snippet,
      user_id,
      page_id,
      page_id_facebook,
      updated_time: conversation.updated_time,
      link: conversation.link
    };
    tasks.push(
      Customer.updateOne({ user_id, page_id, id: customer.id }, customer, {
        upsert: true,
        setDefaultsOnInsert: true,
        new: true
      })
    );
  });
  Promise.all(tasks);
}

module.exports = queue;
