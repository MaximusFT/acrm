'use strict';

module.exports = {
  db: 'mongodb://Nikita:65536@46.36.217.111:27017/mean-dev',
  mongoose: {
    debug: true
  },
  app: {
    name: 'New CRM'
  },
  facebook: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://mapqo.com:3000/auth/facebook/callback'
  },
  twitter: {
    clientID: 'CONSUMER_KEY',
    clientSecret: 'CONSUMER_SECRET',
    callbackURL: 'http://mapqo.com:3000/auth/twitter/callback'
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://mapqo.com:3000/auth/github/callback'
  },
  google: {
    clientID: '672866893020-q41q8tfnsb8rf4otl9vklhhnan2j919n.apps.googleusercontent.com',
    clientSecret: 'ySqu-iepgzWK5Lyv8dh9EIbf',
    callbackURL: 'http://mapqo.com:3000/auth/google/callback'
  },
  linkedin: {
    clientID: 'API_KEY',
    clientSecret: 'SECRET_KEY',
    callbackURL: 'http://mapqo.com:3000/auth/linkedin/callback'
  },
  emailFrom: 'SENDER EMAIL ADDRESS', // sender address like ABC <abc@example.com>
  mailer: {
    service: 'SERVICE_PROVIDER', // Gmail, SMTP
    auth: {
      user: 'EMAIL_ID',
      pass: 'PASSWORD'
    }
  }
};
