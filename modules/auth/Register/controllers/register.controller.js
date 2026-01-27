'use strict';

const registerService = require('../services/register.service');
const logging = require('../../../../logging/logging');
const responses = require('../../../../responses/responses');
const constants = require('../../../../responses/responseConstants');

exports.register = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.AUTH.REGISTER,
        api: 'register'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'REGISTER_REQUEST',
            email: req.body.email,
            user_type: req.body.user_type,
            ip: req.ip
        });

        const response = await registerService.register(apiReference, req.body);

        logging.log(apiReference, {
            EVENT: 'REGISTER_RESPONSE',
            success: response.success,
            user_id: response.data?.user_id,
            user_status: response.data?.user_status
        });

        if (response.success) {
            return responses.success(
                res,
                response.data,
                constants.responseMessages.REGISTER_SUCCESS
            );
        }

        logging.logError(apiReference, {
            EVENT: 'REGISTER_FAILED',
            email: req.body.email,
            error: response.error
        });

        return responses.failure(
            res,
            {},
            response.error
        );
    } catch (err) {
        console.log(err);
        logging.logError(apiReference, err, {
            EVENT: 'REGISTER_CONTROLLER_ERROR',
            email: req.body.email
        });
        return next(err);
    }
};