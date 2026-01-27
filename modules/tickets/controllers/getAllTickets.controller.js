'use strict';

const ticketService = require('../services/getAllTickets.service');
const responses = require('../../../responses/responses');
const logging = require('../../../logging/logging');
const constants = require('../../../responses/responseConstants');

exports.getAllTickets = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.TICKET.GET_ALL,
        api: 'getAllTickets'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_ALL_TICKETS_REQUEST',
            user: req.user.user_id,
            user_type: req.user.user_type
        });

        const response = await ticketService.getAllTickets(
            apiReference,
            req.user
        );

        logging.log(apiReference, {
            EVENT: 'GET_ALL_TICKETS_RESPONSE',
            ticket_count: response.data?.length || 0,
            success: response.success
        });

        if (!response.success) {
            return responses.failure(res, {}, response.error);
        }

        return responses.success(res, response.data);
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_ALL_TICKETS_ERROR',
            user: req.user.user_id
        });
        return next(err);
    }
};