'use strict';

const userDao = require('../dao/user.dao');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.getUserById = async (apiReference, user_id) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_USER_BY_ID_SERVICE_START',
            user_id
        });

        const user = await userDao.fetchUserByUserId(apiReference, user_id);

        if (!user || !user.length) {
            logging.logError(apiReference, {
                EVENT: 'USER_NOT_FOUND',
                user_id
            });
            response.error = constants.responseMessages.USER_NOT_FOUND;
            return response;
        }

        // Remove sensitive information
        const safeUserData = { ...user[0] };
        delete safeUserData.password;

        logging.log(apiReference, {
            EVENT: 'GET_USER_BY_ID_SERVICE_SUCCESS',
            user_id,
            user_type: safeUserData.user_type,
            user_status: safeUserData.user_status
        });

        response.success = true;
        response.data = safeUserData;
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_USER_BY_ID_SERVICE_ERROR',
            user_id
        });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};