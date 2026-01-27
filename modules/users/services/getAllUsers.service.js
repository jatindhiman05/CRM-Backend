'use strict';

const userDao = require('../dao/user.dao');
const logging = require('../../../logging/logging');

exports.getAllUsers = async (apiReference, filters) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_ALL_USERS_SERVICE_START',
            original_filters: filters
        });

        // hard safety guards (don't trust query params)
        const safeFilters = {
            user_type: filters.user_type,
            user_status: filters.user_status,
            search: filters.search,
            page: Math.max(filters.page, 1),
            limit: Math.min(Math.max(filters.limit, 1), 100), // between 1 and 100
            sort_by: ['created_at', 'email', 'name'].includes(filters.sort_by)
                ? filters.sort_by
                : 'created_at',
            order: filters.order === 'ASC' ? 'ASC' : 'DESC'
        };

        logging.log(apiReference, {
            EVENT: 'APPLIED_SAFETY_FILTERS',
            safeFilters
        });

        const users = await userDao.fetchAllUsers(apiReference, safeFilters);

        if (!Array.isArray(users)) {
            logging.logError(apiReference, new Error('Invalid users response'), {
                EVENT: 'INVALID_USERS_RESPONSE',
                users_type: typeof users
            });
            response.error = 'Failed to fetch users';
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'GET_ALL_USERS_SERVICE_SUCCESS',
            user_count: users.length,
            page: safeFilters.page,
            limit: safeFilters.limit
        });

        response.success = true;
        response.data = users;
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_ALL_USERS_SERVICE_ERROR',
            filters
        });
        response.error = 'Failed to fetch users';
        return response;
    }
};