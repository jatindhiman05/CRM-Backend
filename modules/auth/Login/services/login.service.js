'use strict';

const logging = require('../../../../logging/logging');
const passwordService = require('../../../../services/pwdServices');
const jwtService = require('../../../../services/jwtService');
const loginDao = require('../dao/login.dao');
const constants = require('../../../../responses/responseConstants');

const { userStatus } = constants;

exports.login = async (apiReference, values) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'LOGIN_SERVICE_START',
            email: values.email
        });

        const email = values.email.toLowerCase();

        const userResp = await loginDao.fetchUser(apiReference, { email });

        if (!userResp.success) {
            logging.logError(apiReference, {
                EVENT: 'LOGIN_DB_ERROR',
                email: email
            });
            response.error = constants.responseMessages.FAILURE;
            return response;
        }

        if (!userResp.data.length) {
            logging.logError(apiReference, {
                EVENT: 'USER_NOT_FOUND',
                email: email
            });
            response.error = constants.responseMessages.USER_NOT_FOUND;
            return response;
        }

        const user = userResp.data[0];

        logging.log(apiReference, {
            EVENT: 'USER_FOUND_FOR_LOGIN',
            user_id: user.user_id,
            user_type: user.user_type,
            user_status: user.user_status
        });

        // 🔐 Password check
        const isPasswordValid = await passwordService.compare(
            values.password,
            user.password
        );

        if (!isPasswordValid) {
            logging.logError(apiReference, {
                EVENT: 'INVALID_PASSWORD',
                email: email,
                user_id: user.user_id
            });
            response.error = constants.responseMessages.INVALID_CREDENTIALS;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'PASSWORD_VALIDATED',
            user_id: user.user_id
        });

        // 🚧 Status gate
        if (user.user_status !== userStatus.APPROVED) {
            let errorMessage = constants.responseMessages.FAILURE;

            switch (user.user_status) {
                case userStatus.PENDING:
                    errorMessage = constants.responseMessages.USER_PENDING_APPROVAL;
                    break;

                case userStatus.REJECTED:
                    errorMessage = constants.responseMessages.USER_REJECTED;
                    break;

                case userStatus.INACTIVE:
                    errorMessage = constants.responseMessages.USER_INACTIVE;
                    break;
            }

            logging.logError(apiReference, {
                EVENT: 'USER_NOT_APPROVED',
                user_id: user.user_id,
                user_status: user.user_status,
                error: errorMessage
            });

            response.error = errorMessage;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'USER_STATUS_APPROVED',
            user_id: user.user_id
        });

        // 🔑 JWT
        const token = jwtService.createJWT(apiReference, {
            id: user.id,
            user_id: user.user_id,
            user_type: user.user_type
        });

        logging.log(apiReference, {
            EVENT: 'JWT_GENERATED',
            user_id: user.user_id,
            token_length: token.length
        });

        response.success = true;
        response.data = {
            access_token: token,
            user: {
                id: user.id,
                name: user.name,
                user_id: user.user_id,
                email: user.email,
                user_type: user.user_type
            }
        };

        logging.log(apiReference, {
            EVENT: 'LOGIN_SERVICE_SUCCESS',
            user_id: user.user_id,
            user_type: user.user_type
        });

        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'LOGIN_SERVICE_ERROR',
            email: values.email
        });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};