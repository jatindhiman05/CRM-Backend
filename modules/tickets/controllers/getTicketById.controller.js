'use strict';

const service = require('../services/getTicketById.service');
const responses = require('../../../responses/responses');
const logging = require('../../../logging/logging');
const constants = require('../../../responses/responseConstants');

exports.getTicketById = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.TICKET.GET_ONE,
        api: 'getTicketById'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_TICKET_BY_ID_REQUEST',
            user: req.user.user_id,
            ticket_id: req.params.ticket_id
        });

        const response = await service.getTicketById(
            apiReference,
            req.user,
            req.params.ticket_id
        );

        logging.log(apiReference, {
            EVENT: 'GET_TICKET_BY_ID_RESPONSE',
            found: !!response.data,
            success: response.success
        });

        if (response.success) {
            return responses.success(res, response.data);
        }

        return responses.failure(res, {}, response.error);
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_TICKET_BY_ID_ERROR',
            user: req.user.user_id,
            ticket_id: req.params.ticket_id
        });
        return next(err);
    }
};