const SERVER_URL = process.env.HOST || 'localhost:' + process.env.PORT;
module.exports = {
  facebook: {
    genius: {
      VERIFY_TOKEN: 'longnd',
      APP_SECRET: 'f63e4265769ac4b25ebd6abe95c73f01',
      SERVER_URL: 'https://server-chatbot.fuzzy-gecko-36.telebit.io/',
      APP_ID: '412923979642743',
      ACCESS_TOKEN: '412923979642743|f63e4265769ac4b25ebd6abe95c73f01'
    }
  },
  mongodb: {
    host: 'homestead',
    port: '27017',
    dbName: 'chatbot',
    user: 'chatbot',
    pass: 'long@123'
  }
};
