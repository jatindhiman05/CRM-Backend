'use strict';

const loginService = require('../services/login.service');
const logging = require('../../../../logging/logging');
const responses = require('../../../../responses/responses');
const constants = require('../../../../responses/responseConstants');

exports.login = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.AUTH.LOGIN,
        api: 'login'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'LOGIN_REQUEST',
            email: req.body.email,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        });

        const serviceResponse = await loginService.login(apiReference, req.body);

        logging.log(apiReference, {
            EVENT: 'LOGIN_RESPONSE',
            success: serviceResponse.success,
            user_id: serviceResponse.data?.user?.user_id,
            user_type: serviceResponse.data?.user?.user_type
        });

        if (serviceResponse.success) {
            return responses.success(
                res,
                serviceResponse.data,
                constants.responseMessages.LOGIN_SUCCESS
            );
        }

        logging.logError(apiReference, {
            EVENT: 'LOGIN_FAILED',
            email: req.body.email,
            error: serviceResponse.error
        });

        return responses.failure(
            res,
            {},
            serviceResponse.error
        );
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'LOGIN_CONTROLLER_ERROR',
            email: req.body.email
        });
        return next(err);
    }
};