const config = require('config');

module.exports = {
    port: config.get('PORT'),

    selectedDb: config.get('selectedDb'),

    microserviceAuthToken:
        
        config.get('microserviceAuthToken'),

    jwt: {
        secret: config.get('JWT.secret'),
        expiry: config.get('JWT.expiry')
    },

    db: config.get('DB')
};
