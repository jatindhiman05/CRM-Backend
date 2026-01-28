'use strict';

const userDao = require('../dao/user.dao');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

/**
 * =====================================================
 * FETCH USERS (LIST or SINGLE)
 * =====================================================
 * Behaviour:
 *  - If opts.user_id exists → returns ONE user
 *  - Else → returns paginated list
 */
exports.fetchUsers = async (apiReference, opts = {}) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'FETCH_USERS_SERVICE_START',
            opts
        });

        /* =====================================================
           1️⃣ HARD SAFETY GUARDS (NEVER TRUST INPUT)
        ===================================================== */
        const safeOpts = {
            user_id: opts.user_id,

            user_type: opts.user_type,
            user_status: opts.user_status,
            search: opts.search,

            page: Math.max(Number(opts.page) || 1, 1),
            limit: Math.min(Math.max(Number(opts.limit) || 10, 1), 100),

            sort_by: [
                'created_at',
                'updated_at',
                'email',
                'name',
                'user_type',
                'user_status'
            ].includes(opts.sort_by)
                ? opts.sort_by
                : 'created_at',

            order: opts.order === 'ASC' ? 'ASC' : 'DESC'
        };

        logging.log(apiReference, {
            EVENT: 'SANITIZED_USER_FETCH_OPTS',
            safeOpts
        });

        /* =====================================================
           2️⃣ DAO CALL (SINGLE SOURCE OF TRUTH)
        ===================================================== */
        const users = await userDao.fetchUsers(apiReference, safeOpts);

        if (!Array.isArray(users)) {
            logging.logError(apiReference, new Error('Invalid DAO response'), {
                EVENT: 'INVALID_USERS_RESPONSE',
                responseType: typeof users
            });

            response.error = constants.responseMessages.FAILURE;
            return response;
        }

        /* =====================================================
           3️⃣ SINGLE USER MODE
        ===================================================== */
        if (safeOpts.user_id) {
            if (!users.length) {
                response.error = constants.responseMessages.USER_NOT_FOUND;
                return response;
            }

            const safeUser = { ...users[0] };
            delete safeUser.password;

            response.success = true;
            response.data = safeUser;
            return response;
        }

        /* =====================================================
           4️⃣ LIST MODE
        ===================================================== */
        const sanitizedUsers = users.map(user => {
            const safeUser = { ...user };
            delete safeUser.password;
            return safeUser;
        });

        response.success = true;
        response.data = sanitizedUsers;
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'FETCH_USERS_SERVICE_ERROR',
            opts
        });

        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};
