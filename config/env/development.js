'use strict';

module.exports = {
    //db: 'mongodb://Nikita:65536@46.36.217.111:27017/mean-dev',
    db: 'mongodb://Nikita:1gL43y68X9KG9U6g7E9v55t89a8L9jCe@5.101.114.123:27017/mean-dev',
    //db: 'mongodb://localhost/mean-dev',
    mongoose: {
        debug: true
    },
    app: {
        name: 'ACRM'
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
    /*emailFrom: 'lolmailsuptest@gmail.com', // sender address like ABC <abc@example.com>
    mailer: {
      service: 'Gmail', // Gmail, SMTP
      auth: {
        user: 'lolmailsuptest@gmail.com',
        pass: 'kbknsG8PzVz04oQU'
      }
    }*/
    emailFrom: 'ACRM Support Service', // sender address like ABC <abc@example.com>
    mailer: {
        service: 'SMTP',
        auth: {
            user: 'support@mapqo.com',
            pass: 'qElJhX2q9B'
        },
        host: 'mail.mailgroup.pro',
        port: 587,
        secure: false,
        requireTLS: true,
        tls: {
            rejectUnauthorized: false
        }
    }
};
