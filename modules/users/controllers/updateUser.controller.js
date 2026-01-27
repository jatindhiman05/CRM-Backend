'use strict';

const service = require('../services/updateUser.service');
const responses = require('../../../responses/responses');
const logging = require('../../../logging/logging');
const constants = require('../../../responses/responseConstants');

exports.updateUser = async (req, res, next) => {
    const apiReference = {
        module: 'user',
        api: 'updateUser'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'UPDATE_USER_REQUEST',
            user: req.user.user_id,
            target_user_id: req.params.user_id,
            updates: req.body
        });

        const updateData = {
            ...req.body,
            user_id: req.params.user_id
        };

        const response = await service.updateUser(apiReference, updateData);

        logging.log(apiReference, {
            EVENT: 'UPDATE_USER_RESPONSE',
            success: response.success,
            updates: Object.keys(req.body)
        });

        if (!response.success) {
            return responses.failure(res, {}, response.error);
        }

        return responses.success(res, response.data, constants.responseMessages.SUCCESS);
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'UPDATE_USER_ERROR',
            user: req.user.user_id,
            target_user_id: req.params.user_id
        });
        return next(err);
    }
};