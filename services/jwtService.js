'use strict';

const jwt = require('jsonwebtoken');
const logging = require('../logging/logging');
const envProperties = require('../properties/envProperties');

const createJWT = (apiReference, payload, expiry) => {
    logging.log(apiReference, {
        EVENT: 'CREATING JWT',
        PAYLOAD: payload
    });

    return jwt.sign(payload, envProperties.jwt.secret, {
        expiresIn: expiry || envProperties.jwt.expiry
    });
};

const verifyJwt = (apiReference, token) => {
    logging.log(apiReference, {
        EVENT: 'VERIFYING JWT',
        TOKEN: token
    });

    try {
        return jwt.verify(token, envProperties.jwt.secret);
    } catch (err) {
        logging.logError(apiReference, err);
        return null;
    }
};

module.exports = {
    createJWT,
    verifyJwt
};
