module.exports = {
  facebook: {
    graphUrl: 'https://graph.facebook.com/v5.0',
    graphVersion: 'v5.0',
    VERIFY_TOKEN: 'longnd',
    APP_SECRET: 'f63e4265769ac4b25ebd6abe95c73f01',
    SERVER_URL: 'https://dev.chatbot.negoo.tech',
    APP_ID: '412923979642743'
  },
  mongodb: {
    host: 'homestead',
    port: '27017',
    dbName: 'chatbot',
    user: 'chatbot',
    pass: 'long@123'
  },
  env: {
    PORT: 3001,
    NODE_ENV: 'development' // | development || production
  },
  token: {
    driver: 'none', // | none | redis
    config: {
      host: 'localhost',
      port: 6379
    }
  },
  jwt: {
    JWT_SECRET: 'longnd',
    TOKEN_EXPIRES: 5184000 // 60 day
  }
};
