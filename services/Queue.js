const kue = require("kue");
const axios = require("axios").default;
const { graphUrl } = require(__dirroot + "/config").facebook;
const Customer = require(__dirroot + "/models/Customer");
const { updateManyJob } = require("../providers/JobProvider");
const { sendFlow } = require("./Facebook");
const config = require(__dirroot + "/config");
// set options
const queue = kue.createQueue({
  redis: config.kue.redis,
});
queue.setMaxListeners(1000 * 1000);
queue.on("error", function (err) {
  console.log("Oops... ", err);
});

// Declare queue
queue.process("postfacebookapi", 20, postFacebookAPI);
queue.process("crawl-customer", 100, crawlCustomerFacebook);
queue.process("send-broadcast", 1000, sendBroadcast);

/**
 *
 * @param {*} job
 * @param {*} done
 */
function sendBroadcast(job, done) {
  const { flow_id, senderIds, user_id, page_id, job_id, job_repeat } = job.data;
  _log("send broadcast message to ", senderIds);
  sendFlow(flow_id, senderIds, user_id, page_id)
    .then(async (rs) => {
      _log("send broadcast success", JSON.stringify(rs, null, 2));
      // update job status
      await updateManyJob(
        { _id: job_id },
        { $set: { status: job_repeat === "none" ? "complete" : "active" } },
        {
          upsert: false,
        }
      );
    })
    .catch(async (error) => {
      _log("send flow from broadcast error", error);
      await updateManyJob(
        { _id: job_id },
        {
          $set: {
            status: "error",
          },
        },
        {
          upsert: false,
        }
      );
    })
    .then(() => {
      done();
    });
}

//
function postFacebookAPI(job, done) {
  const { url, data, params } = job.data;
  _log("sendMessage to ", { data });
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
    limit,
  } = job.data;
  _log("crawl customer", job.data);
  const endpoint = url || `${graphUrl}/${page_id_facebook}/conversations`;
  const options = url
    ? {}
    : {
        params: {
          limit,
          fields: "senders,updated_time,link,can_reply,snippet",
          access_token,
        },
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
    _log("Crawl customer success for page : ", page_id_facebook);
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
  _log("crawl next customer ", url);
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
  data.map(function (conversation) {
    let customer =
      conversation.senders.data.find(
        (sender) => sender.id !== page_id_facebook
      ) || {};
    customer = {
      ...customer,
      type: "facebook",
      can_reply: conversation.can_reply,
      snippet: conversation.snippet,
      user_id,
      page_id,
      page_id_facebook,
      updated_time: conversation.updated_time,
      is_subscribe: true,
      link: conversation.link,
    };
    tasks.push(
      Customer.updateOne({ user_id, page_id, id: customer.id }, customer, {
        upsert: true,
        setDefaultsOnInsert: true,
        new: true,
      })
    );
  });
  Promise.all(tasks);
}

queue.updateCustomer = updateCustomer;
module.exports = queue;
