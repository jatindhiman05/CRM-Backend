'use strict';

const ticketDao = require('../dao/ticket.dao');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.getTicketById = async (apiReference, user, ticketId) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_TICKET_BY_ID_SERVICE_START',
            user: user.user_id,
            ticketId
        });

        const ticketResp = await ticketDao.fetchTicketById(
            apiReference,
            ticketId
        );

        if (!ticketResp || !ticketResp.length) {
            logging.logError(apiReference, {
                EVENT: 'TICKET_NOT_FOUND',
                ticketId
            });
            response.error = constants.responseMessages.TICKET_NOT_FOUND;
            return response;
        }

        const ticket = ticketResp[0];

        // Authorization check
        const isAllowed = ticket.reporter === user.user_id ||
            user.user_type === constants.userTypes.ADMIN ||
            user.user_type === constants.userTypes.ENGINEER;

        logging.log(apiReference, {
            EVENT: 'AUTHORIZATION_CHECK',
            ticket_reporter: ticket.reporter,
            user_id: user.user_id,
            is_allowed: isAllowed
        });

        if (!isAllowed) {
            logging.logError(apiReference, {
                EVENT: 'UNAUTHORIZED_ACCESS_TICKET',
                user: user.user_id,
                ticketId
            });
            response.error = constants.responseMessages.UNAUTHORIZED_ACCESS;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'TICKET_RETRIEVED_SUCCESS',
            ticketId
        });

        response.success = true;
        response.data = ticket;
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_TICKET_BY_ID_SERVICE_ERROR',
            user: user.user_id,
            ticketId
        });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};