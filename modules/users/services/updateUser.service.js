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
        const userCheck = await userDao.fetchUsers(apiReference, {user_id : payload.user_id});

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
        let hasValidUpdate = false;
        let hasActualChange = false;

        // Valid values based on actual database schema
        const validUserTypes = ['CUSTOMER', 'ENGINEER', 'ADMIN'];
        const validUserStatuses = ['APPROVED', 'PENDING', 'BLOCKED']; // Updated to match schema

        // Handle user_type update
        if (payload.user_type !== undefined && payload.user_type !== null) {
            if (validUserTypes.includes(payload.user_type.toUpperCase())) {
                const newUserType = payload.user_type.toUpperCase();
                if (newUserType !== existingUser.user_type) {
                    updateObj.user_type = newUserType;
                    hasActualChange = true;
                }
                hasValidUpdate = true;
            } else {
                logging.logError(apiReference, {
                    EVENT: 'INVALID_USER_TYPE',
                    provided_type: payload.user_type,
                    valid_types: validUserTypes
                });
                response.error = constants.responseMessages.INVALID_USER_TYPE;
                return response; // Return error for invalid type
            }
        }

        // Handle user_status update - UPDATED to match schema
        if (payload.user_status !== undefined && payload.user_status !== null) {
            if (validUserStatuses.includes(payload.user_status.toUpperCase())) {
                const newUserStatus = payload.user_status.toUpperCase();
                if (newUserStatus !== existingUser.user_status) {
                    updateObj.user_status = newUserStatus;
                    hasActualChange = true;
                }
                hasValidUpdate = true;
            } else {
                logging.logError(apiReference, {
                    EVENT: 'INVALID_USER_STATUS',
                    provided_status: payload.user_status,
                    valid_statuses: validUserStatuses
                });
                response.error = constants.responseMessages.INVALID_USER_STATUS;
                return response; // Return error for invalid status
            }
        }

        // Check if we have any valid fields to update
        if (!hasValidUpdate) {
            logging.logError(apiReference, {
                EVENT: 'NO_VALID_UPDATES_PROVIDED',
                existing_user_type: existingUser.user_type,
                existing_user_status: existingUser.user_status
            });
            response.error = constants.responseMessages.MISSING_PARAMETER;
            return response;
        }

        // Check if any of the valid updates actually change the values
        if (!hasActualChange) {
            logging.logError(apiReference, {
                EVENT: 'DUPLICATE_UPDATE_REQUEST',
                user_id: payload.user_id,
                requested_updates: payload,
                existing_values: {
                    user_type: existingUser.user_type,
                    user_status: existingUser.user_status
                }
            });
            response.error = constants.responseMessages.NOTHING_TO_UPDATE;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'APPLYING_USER_UPDATES',
            updateObj,
            hasActualChange
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
            updated_fields: Object.keys(updateObj),
            previous_values: {
                user_type: existingUser.user_type,
                user_status: existingUser.user_status
            },
            updated_values: updateObj
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