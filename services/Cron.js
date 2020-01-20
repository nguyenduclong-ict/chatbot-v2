var CronJob = require('cron').CronJob;
const tasks = [];
const { getManyPage } = require('../providers/PageProvider');
const {
  getManyCustomer,
  updateManyCustomer
} = require('../providers/CustomerProvider');

const { getManyJob, updateManyJob } = require('../providers/JobProvider');

const Queue = require('../services/Queue');

const cronJob = new CronJob(
  '0 * * * * *',
  async function() {
    const now = new Date();

    const currentTime = {
      dayOfWeek: now.getDay(),
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
      hour: now.getHours(),
      minute: now.getMinutes()
    };

    const [noRepeat, repeatWeekly, repeatMonthly] = await Promise.all([
      getManyJob(
        {
          status: 'active',
          // find match date time
          'date_time_detail.year': currentTime.year,
          'date_time_detail.month': currentTime.month,
          'date_time_detail.day': currentTime.day,
          'date_time_detail.hour': currentTime.hour,
          'date_time_detail.minute': {
            $gte: currentTime.minute,
            $lt: currentTime.minute + 1
          },
          repeat: 'none'
        },
        {
          populate: ['page_id']
        }
      ),
      getManyJob(
        {
          status: 'active',
          // find match date time
          'date_time_detail.hour': currentTime.hour,
          'date_time_detail.hour': currentTime.hour,
          'date_time_detail.minute': {
            $gte: currentTime.minute,
            $lt: currentTime.minute + 1
          },
          weekly: currentTime.dayOfWeek,
          repeat: 'weekly'
        },
        {
          populate: ['page_id']
        }
      ),
      getManyJob(
        {
          status: 'active',
          // find match date time
          'date_time_detail.hour': currentTime.hour,
          'date_time_detail.minute': {
            $gte: currentTime.minute,
            $lt: currentTime.minute + 1
          },
          monthly: currentTime.day,
          repeat: 'monthly'
        },
        {
          populate: ['page_id']
        }
      )
    ]);

    Promise.all([
      updateManyJob(
        {
          _id: {
            $in: noRepeat.data.map(j => j._id)
          }
        },
        { status: 'doing' },
        { upsert: false }
      ),
      updateManyJob(
        {
          _id: {
            $in: repeatWeekly.data.map(j => j._id)
          }
        },
        { status: 'doing' },
        { upsert: false }
      ),
      updateManyJob(
        {
          _id: {
            $in: repeatMonthly.data.map(j => j._id)
          }
        },
        { status: 'doing' },
        { upsert: false }
      )
    ]);
    noRepeat.data.forEach(handleJob);
    repeatMonthly.data.forEach(handleJob);
    repeatWeekly.data.forEach(handleJob);
  },
  null,
  true,
  'Asia/Ho_Chi_Minh'
);

async function handleJob(job) {
  if (job.action === 'start_flow') {
    const customerQuery = {
      page_id: job.page_id._id,
      user_id: job.user_id,
      is_subscribe: true
    };

    if (!job.target.send_to_all) {
      if (job.target.send_to_tags.length) {
        customerQuery.tags = {
          $in: job.target.send_to_tags
        };
      }
      if (job.target.send_to.length) {
        _.set(customerQuery, '_id.$in', job.target.send_to);
      }
      if (job.target.exclude.length) {
        _.set(customerQuery, '_id.$nin', job.target.exclude);
      }
    }
    const customers = (await getManyCustomer(customerQuery)).data;
    Queue.create('send-broadcast', {
      flow_id: job.flow_id,
      senderIds: customers.map(customer => customer.id),
      user_id: job.user_id,
      page_id: job.page_id.id,
      job_id: job._id,
      job_repeat: job.repeat
    })
      .removeOnComplete(true)
      .save();
  }
}

tasks.push({
  name: 'broadcast-job',
  description: 'Check broadcast job and excute',
  job: cronJob
});

module.exports = tasks;
