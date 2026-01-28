'use strict';

const service = require('../services/fetchTickets.service');
const responses = require('../../../responses/responses');
const logging = require('../../../logging/logging');
const constants = require('../../../responses/responseConstants');

exports.fetchTickets = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.TICKET.FETCH,
        api: 'fetchTickets'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'FETCH_TICKETS_REQUEST',
            user: req.user.user_id,
            user_type: req.user.user_type,
            query: req.query,
            params: req.params
        });

        // Merge route params and query for the service
        const params = { ...req.query, ticket_id: req.params.ticket_id };

        const response = await service.fetchTickets(apiReference, req.user, params);

        logging.log(apiReference, {
            EVENT: 'FETCH_TICKETS_RESPONSE',
            success: response.success,
            count: response.data?.length || 0
        });

        if (response.success) {
            return responses.success(
                res,
                response.data,
                constants.responseMessages.TICKETS_FETCHED
            );
        }

        return responses.failure(res, {}, response.error);

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'FETCH_TICKETS_ERROR',
            user: req.user.user_id,
            query: req.query,
            params: req.params
        });
        return next(err);
    }
};
