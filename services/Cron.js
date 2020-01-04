var CronJob = require('cron').CronJob;
const jobs = [];
const { getManyPage } = require('../providers/PageProvider');
const { getManyCustomer } = require('../providers/CustomerProvider');
const Queue = require('../services/Queue');

const checkBroadCastMessage = new CronJob(
  '1 * * * * *',
  async function() {
    console.log('Check broadcast message');
    const rs1 = await getManyPage({ is_active: true }, {});
    const { access_token } = rs1.data[0];
    const rs2 = await getManyCustomer({ page_id: rs1.data[0]._id }, {});
    const customers = rs2.data;
    const senderIds = customers.map(e => e.id);
    const message = {
      text: 'Test Broadcast ' + new Date().toLocaleString('vi')
    };
    Queue.create('send-broadcast-message', {
      access_token,
      senderIds,
      message
    }).save();
  },
  null,
  true,
  'Asia/Ho_Chi_Minh'
);

jobs.push({
  name: 'checkBroadCastMessage',
  description: 'check broadcast message',
  job: checkBroadCastMessage
});

module.exports = jobs;
