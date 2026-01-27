const config = require('config');

module.exports = {
    port: process.env.AUTH_PORT || config.get('PORT'),

    selectedDb: config.get('selectedDb'),

    microserviceAuthToken:
        process.env.MICROSERVICE_AUTH_TOKEN ||
        config.get('microserviceAuthToken'),

    jwt: {
        secret: process.env.JWT_SECRET || config.get('JWT.secret'),
        expiry: process.env.JWT_EXPIRY || config.get('JWT.expiry')
    },

    db: config.get('DB')
};
