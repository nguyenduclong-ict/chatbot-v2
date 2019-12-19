const kue = require('kue');
const axios = require('axios').default;
const queue = kue.createQueue();

queue.process('postfacebookapi', 10, postFacebookAPI);

function postFacebookAPI(job, done) {
  const { url, data, params } = job.data;
  _log('sendMessage to ', { data });
  axios.post(url, data, { params }).then(() => {
    done();
  });
}

module.exports = queue;
