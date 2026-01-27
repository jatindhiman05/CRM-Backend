'use strict';

const service = require('../services/getAllUsers.service');
const responses = require('../../../responses/responses');
const logging = require('../../../logging/logging');

exports.getAllUsers = async (req, res, next) => {
    const apiReference = {
        module: 'user',
        api: 'getAllUsers'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_ALL_USERS_REQUEST',
            user: req.user.user_id,
            user_type: req.user.user_type,
            query_params: req.query
        });

        const filters = {
            user_type: req.query.user_type,
            user_status: req.query.user_status,
            search: req.query.search,
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            sort_by: req.query.sort_by || 'created_at',
            order: req.query.order || 'DESC'
        };

        const response = await service.getAllUsers(apiReference, filters);

        logging.log(apiReference, {
            EVENT: 'GET_ALL_USERS_RESPONSE',
            user_count: response.data?.length || 0,
            page: filters.page,
            limit: filters.limit
        });

        if (!response.success) {
            return responses.failure(res, {}, response.error);
        }

        return responses.success(res, response.data);
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_ALL_USERS_ERROR',
            user: req.user.user_id,
            query_params: req.query
        });
        return next(err);
    }
};