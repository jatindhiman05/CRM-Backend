'use strict';

const jwtService = require('../services/jwtService');
const responses = require('../responses/responses');
const logging = require('../logging/logging');

exports.authenticateUser = async (req, res, next) => {
    const apiReference = req.apiReference;

    try {
        logging.log(apiReference, { EVENT: 'AUTHENTICATE_USER' });

        const token = req.headers['access-token'];

        if (!token) {
            return responses.invalidAuthKey(res);
        }

        const decoded = jwtService.verifyJwt(apiReference, token);

        if (!decoded) {
            return responses.invalidAuthKey(res);
        }

        //Attach user context (MANDATORY)
        req.user = {
            id: decoded.id,
            user_id: decoded.user_id,
            user_type: decoded.user_type
        };


        logging.log(apiReference, {
            EVENT: 'USER_AUTH_SUCCESS',
            user_id: decoded.user_id,
            user_type: decoded.user_type
        });

        next();
    } catch (err) {
        logging.logError(apiReference, err);
        return responses.invalidAuthKey(res);
    }
};
