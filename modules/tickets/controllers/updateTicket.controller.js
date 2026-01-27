'use strict';

const ticketService = require('../services/updateTicket.service');
const responses = require('../../../responses/responses');
const logging = require('../../../logging/logging');
const constants = require('../../../responses/responseConstants');

exports.updateTicket = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.TICKET.UPDATE,
        api: 'updateTicket'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'UPDATE_TICKET_REQUEST',
            user: req.user.user_id,
            ticket_id: req.params.ticket_id,
            updates: req.body
        });

        const response = await ticketService.updateTicket(
            apiReference,
            req.user,
            req.params.ticket_id,
            req.body
        );

        logging.log(apiReference, {
            EVENT: 'UPDATE_TICKET_RESPONSE',
            success: response.success,
            updated_fields: response.data?.updated_fields
        });

        if (!response.success) {
            return responses.failure(res, {}, response.error);
        }

        return responses.success(
            res,
            response.data,
            constants.responseMessages.TICKET_UPDATED
        );
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'UPDATE_TICKET_ERROR',
            user: req.user.user_id,
            ticket_id: req.params.ticket_id
        });
        return next(err);
    }
};