'use strict';

const crypto = require('crypto');
const logging = require('../../../../logging/logging');

const PREFIX_MAP = {
    CUSTOMER: 'CUS',
    ENGINEER: 'ENG',
    ADMIN: 'ADM'
};

exports.generateUserId = (userType) => {
    const apiReference = {
        module: 'utils',
        api: 'generateUserId'
    };

    try {
        const prefix = PREFIX_MAP[userType] || 'USR';
        const random = crypto.randomBytes(4).toString('hex'); // 8 chars

        const userId = `${prefix}_${random}`;

        logging.log(apiReference, {
            EVENT: 'USER_ID_GENERATED',
            user_type: userType,
            prefix: prefix,
            user_id: userId
        });

        return userId;
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'USER_ID_GENERATION_ERROR',
            user_type: userType
        });
        // Fallback to timestamp based ID
        const fallbackId = `USR_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
        return fallbackId;
    }
};