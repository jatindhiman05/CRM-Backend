'use strict';

const ticketDao = require('../dao/ticket.dao');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.updateTicket = async (apiReference, user, ticketId, updates, beforeId, afterId) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'UPDATE_TICKET_SERVICE_START',
            user_id: user.user_id,
            ticketId,
            updates,
            beforeId,
            afterId
        });

        const ticketResp = await ticketDao.fetchTickets(apiReference, {id: ticketId});
        if (!ticketResp.length) {
            response.error = constants.responseMessages.TICKET_NOT_FOUND;
            return response;
        }

        const ticket = ticketResp[0];

        // Authorization
        if (!(user.user_type === constants.userTypes.ADMIN || ticket.reporter === user.user_id || ticket.assignee === user.user_id)) {
            response.error = constants.responseMessages.UNAUTHORIZED_ACCESS;
            return response;
        }

        const updatePayload = { ...updates };

        // Drag & drop logic
        if (beforeId && afterId) {
            const beforeTicket = await ticketDao.fetchTickets(apiReference, {id : beforeId});
            const afterTicket = await ticketDao.fetchTickets(apiReference, {id : afterId});

            if (!beforeTicket.length || !afterTicket.length) {
                response.error = 'Before or After ticket not found';
                return response;
            }

            updatePayload.ticket_priority = (beforeTicket[0].ticket_priority + afterTicket[0].ticket_priority) / 2;
        }

        const updateResp = await ticketDao.updateTicket(apiReference, updatePayload, ticketId);

        if (!updateResp || updateResp.affectedRows === 0) {
            response.error = constants.responseMessages.UPDATE_FAILED;
            return response;
        }

        response.success = true;
        response.data = { ticket_id: ticketId, updated_fields: Object.keys(updatePayload) };
        return response;

    } catch (err) {
        logging.logError(apiReference, err, { EVENT: 'UPDATE_TICKET_SERVICE_ERROR', user_id: user.user_id });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};
