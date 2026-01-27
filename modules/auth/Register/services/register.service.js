'use strict';

const logging = require('../../../../logging/logging');
const passwordService = require('../../../../services/pwdServices');
const registerDao = require('../dao/register.dao');
const constants = require('../../../../responses/responseConstants');
const { generateUserId } = require('../utils/userIdGenerator');

exports.register = async (apiReference, values) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'REGISTER_SERVICE_START',
            email: values.email,
            user_type: values.user_type
        });

        // Normalize email
        values.email = values.email.toLowerCase();

        logging.log(apiReference, {
            EVENT: 'CHECKING_DUPLICATE_EMAIL',
            email: values.email
        });

        // 1️⃣ Check duplicate email
        const existingUser = await registerDao.fetchUser(apiReference, {
            email: values.email
        });

        if (!existingUser.success) {
            logging.logError(apiReference, new Error('Failed to check existing user'), {
                EVENT: 'DUPLICATE_CHECK_ERROR',
                email: values.email
            });
            response.error = constants.responseMessages.FAILURE;
            return response;
        }

        if (existingUser.data.length>0) {
            logging.logError(apiReference, {
                EVENT: 'EMAIL_ALREADY_REGISTERED',
                email: values.email,
                existing_user_id: existingUser.data[0]?.user_id
            });
            response.error = constants.responseMessages.USER_ALREADY_REGISTERED;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'EMAIL_AVAILABLE',
            email: values.email
        });

        // 2️⃣ Decide status
        let user_status = constants.userStatus.APPROVED;
        if ([constants.userTypes.ENGINEER, constants.userTypes.ADMIN].includes(values.user_type)) {
            user_status = constants.userStatus.PENDING;
        }

        logging.log(apiReference, {
            EVENT: 'USER_STATUS_DECIDED',
            user_type: values.user_type,
            user_status: user_status
        });

        // 3️⃣ Generate user_id (SERVER OWNED)
        const user_id = generateUserId(values.user_type);

        logging.log(apiReference, {
            EVENT: 'USER_ID_GENERATED',
            user_id: user_id
        });

        // 4️⃣ Build insert payload
        const insertPayload = {
            name: values.name,
            user_id,
            email: values.email,
            password: await passwordService.encrypt(values.password),
            user_type: values.user_type,
            user_status: user_status
        };

        // Remove password from logs
        const safeInsertPayload = { ...insertPayload };
        delete safeInsertPayload.password;

        logging.log(apiReference, {
            EVENT: 'CREATING_USER_RECORD',
            payload: safeInsertPayload
        });

        const insertResp = await registerDao.createUser(apiReference, insertPayload);

        if (!insertResp.success) {
            logging.logError(apiReference, new Error('User creation failed'), {
                EVENT: 'USER_CREATION_FAILED',
                email: values.email
            });
            response.error = constants.responseMessages.FAILURE;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'USER_CREATED_SUCCESSFULLY',
            user_id: user_id,
            insert_id: insertResp.data.insertId
        });

        response.success = true;
        response.data = {
            user_id,
            user_type: values.user_type,
            user_status
        };

        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'REGISTER_SERVICE_ERROR',
            email: values.email
        });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};