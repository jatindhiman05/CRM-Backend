'use strict';

const service = require('../services/getUserById.service');
const responses = require('../../../responses/responses');
const logging = require('../../../logging/logging');

exports.getUserById = async (req, res, next) => {
    const apiReference = {
        module: 'user',
        api: 'getUserById'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_USER_BY_ID_REQUEST',
            user: req.user.user_id,
            requested_user_id: req.params.user_id
        });

        const response = await service.getUserById(
            apiReference,
            req.params.user_id
        );

        logging.log(apiReference, {
            EVENT: 'GET_USER_BY_ID_RESPONSE',
            found: !!response.data,
            success: response.success
        });

        if (!response.success) {
            return responses.failure(res, {}, response.error);
        }

        return responses.success(res, response.data);
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_USER_BY_ID_ERROR',
            user: req.user.user_id,
            requested_user_id: req.params.user_id
        });
        return next(err);
    }
};