const SERVER_URL = process.env.HOST || 'localhost:' + process.env.PORT;
module.exports = {
  facebook: {
    genius: {
      VERIFY_TOKEN: 'longnd',
      APP_SECRET: 'abc',
      SERVER_URL
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
