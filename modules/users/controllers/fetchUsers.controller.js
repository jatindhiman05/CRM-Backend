'use strict';

const userService = require('../services/fetchUsers.service');
const responses = require('../../../responses/responses');
const logging = require('../../../logging/logging');

exports.fetchUsers = async (req, res, next) => {
    const apiReference = {
        module: 'USER',
        api: req.params.user_id ? 'FETCH_USER_BY_ID' : 'FETCH_USERS'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'FETCH_USERS_REQUEST',
            requested_by: req.user.user_id,
            target_user_id: req.params.user_id,
            query: req.query
        });

        /* =====================================================
           BUILD OPTIONS OBJECT (SINGLE SOURCE OF TRUTH)
        ===================================================== */
        const opts = {
            user_id: req.params.user_id, // undefined for list

            filters: {
                user_type: req.query.user_type,
                user_status: req.query.user_status,
                search: req.query.search
            },

            pagination: {
                page: Number(req.query.page),
                limit: Number(req.query.limit)
            },

            sort: {
                by: req.query.sort_by,
                order: req.query.order
            }
        };

        /* =====================================================
           SERVICE CALL
        ===================================================== */
        const response = await userService.fetchUsers(
            apiReference,
            opts
        );

        logging.log(apiReference, {
            EVENT: 'FETCH_USERS_RESPONSE',
            success: response.success,
            result_count: Array.isArray(response.data)
                ? response.data.length
                : response.data ? 1 : 0
        });

        if (!response.success) {
            return responses.failure(res, {}, response.error);
        }

        return responses.success(res, response.data);

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'FETCH_USERS_CONTROLLER_ERROR',
            requested_by: req.user.user_id
        });
        return next(err);
    }
};
