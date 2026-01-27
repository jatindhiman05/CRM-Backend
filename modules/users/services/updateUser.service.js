'use strict';

const userDao = require('../dao/user.dao');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.updateUser = async (apiReference, payload) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'UPDATE_USER_SERVICE_START',
            target_user_id: payload.user_id,
            requested_updates: payload
        });

        // Validate user_id exists
        const userCheck = await userDao.fetchUserByUserId(apiReference, payload.user_id);

        if (!userCheck || !userCheck.length) {
            logging.logError(apiReference, {
                EVENT: 'USER_NOT_FOUND_FOR_UPDATE',
                user_id: payload.user_id
            });
            response.error = constants.responseMessages.USER_NOT_FOUND;
            return response;
        }

        const existingUser = userCheck[0];

        // Build update object with validation
        const updateObj = {};
        const validUserTypes = ['CUSTOMER', 'ENGINEER', 'ADMIN'];
        const validUserStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'INACTIVE'];

        if (payload.user_type) {
            if (validUserTypes.includes(payload.user_type.toUpperCase())) {
                updateObj.user_type = payload.user_type.toUpperCase();
            } else {
                logging.logError(apiReference, {
                    EVENT: 'INVALID_USER_TYPE',
                    provided_type: payload.user_type
                });
            }
        }

        if (payload.user_status) {
            if (validUserStatuses.includes(payload.user_status.toUpperCase())) {
                updateObj.user_status = payload.user_status.toUpperCase();
            } else {
                logging.logError(apiReference, {
                    EVENT: 'INVALID_USER_STATUS',
                    provided_status: payload.user_status
                });
            }
        }

        // Check for no-op updates
        const hasValidUpdate = Object.keys(updateObj).length > 0;
        if (!hasValidUpdate) {
            logging.logError(apiReference, {
                EVENT: 'NO_VALID_UPDATES_PROVIDED',
                existing_user_type: existingUser.user_type,
                existing_user_status: existingUser.user_status
            });
            response.error = constants.responseMessages.MISSING_PARAMETER;
            return response;
        }

        // Check if update actually changes anything
        const isSameAsExisting =
            (updateObj.user_type && updateObj.user_type === existingUser.user_type) &&
            (updateObj.user_status && updateObj.user_status === existingUser.user_status);

        if (isSameAsExisting) {
            logging.logError(apiReference, {
                EVENT: 'DUPLICATE_UPDATE_REQUEST',
                user_id: payload.user_id
            });
            response.error = constants.responseMessages.NOTHING_TO_UPDATE;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'APPLYING_USER_UPDATES',
            updateObj
        });

        const updateResult = await userDao.updateUser(apiReference, updateObj, payload.user_id);

        if (!updateResult || updateResult.affectedRows === 0) {
            logging.logError(apiReference, {
                EVENT: 'USER_UPDATE_FAILED',
                user_id: payload.user_id,
                affected_rows: updateResult?.affectedRows
            });
            response.error = constants.responseMessages.UPDATE_FAILED;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'USER_UPDATE_SUCCESS',
            user_id: payload.user_id,
            updated_fields: Object.keys(updateObj),
            affected_rows: updateResult.affectedRows
        });

        response.success = true;
        response.data = {
            user_id: payload.user_id,
            updated_fields: Object.keys(updateObj)
        };
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'UPDATE_USER_SERVICE_ERROR',
            user_id: payload.user_id
        });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};