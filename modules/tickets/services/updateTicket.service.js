'use strict';

const ticketDao = require('../dao/ticket.dao');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.updateTicket = async (apiReference, user, ticketId, updateObj) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'UPDATE_TICKET_SERVICE_START',
            user: user.user_id,
            ticketId,
            requested_updates: updateObj
        });

        // 1️⃣ Fetch ticket
        const ticketResp = await ticketDao.fetchTicketById(apiReference, ticketId);

        if (!ticketResp || !ticketResp.length) {
            logging.logError(apiReference, {
                EVENT: 'TICKET_NOT_FOUND_FOR_UPDATE',
                ticketId
            });
            response.error = constants.responseMessages.TICKET_NOT_FOUND;
            return response;
        }

        const ticket = ticketResp[0];

        // 2️⃣ Authorization
        const isAllowed = user.user_type === constants.userTypes.ADMIN ||
            ticket.reporter === user.user_id ||
            ticket.assignee === user.user_id;

        logging.log(apiReference, {
            EVENT: 'UPDATE_AUTHORIZATION_CHECK',
            ticket_reporter: ticket.reporter,
            ticket_assignee: ticket.assignee,
            user_id: user.user_id,
            user_type: user.user_type,
            is_allowed: isAllowed
        });

        if (!isAllowed) {
            logging.logError(apiReference, {
                EVENT: 'UNAUTHORIZED_TICKET_UPDATE',
                user: user.user_id,
                ticketId
            });
            response.error = constants.responseMessages.UNAUTHORIZED_ACCESS;
            return response;
        }

        // 3️⃣ Build SAFE update object
        const updatePayload = {};
        if (updateObj.title) updatePayload.title = updateObj.title;
        if (updateObj.description) updatePayload.description = updateObj.description;

        // Validate status if provided
        if (updateObj.status) {
            const validStatuses = ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'CLOSED'];
            if (validStatuses.includes(updateObj.status.toUpperCase())) {
                updatePayload.status = updateObj.status.toUpperCase();
            } else {
                logging.logError(apiReference, {
                    EVENT: 'INVALID_STATUS_VALUE',
                    provided_status: updateObj.status
                });
            }
        }

        if (updateObj.ticket_priority) {
            if (updateObj.ticket_priority >= 1 && updateObj.ticket_priority <= 5) {
                updatePayload.ticket_priority = updateObj.ticket_priority;
            } else {
                logging.logError(apiReference, {
                    EVENT: 'INVALID_PRIORITY_VALUE',
                    provided_priority: updateObj.ticket_priority
                });
            }
        }

        if (!Object.keys(updatePayload).length) {
            logging.logError(apiReference, {
                EVENT: 'NO_VALID_UPDATES_PROVIDED'
            });
            response.error = constants.responseMessages.NOTHING_TO_UPDATE;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'APPLYING_UPDATES',
            updatePayload
        });

        // 4️⃣ Update
        const updateResp = await ticketDao.updateTicket(
            apiReference,
            updatePayload,
            ticketId
        );

        if (!updateResp || updateResp.affectedRows === 0) {
            logging.logError(apiReference, {
                EVENT: 'TICKET_UPDATE_FAILED',
                ticketId
            });
            response.error = constants.responseMessages.UPDATE_FAILED;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'TICKET_UPDATED_SUCCESS',
            ticketId,
            affected_rows: updateResp.affectedRows,
            updated_fields: Object.keys(updatePayload)
        });

        response.success = true;
        response.data = {
            ticket_id: ticketId,
            updated_fields: Object.keys(updatePayload)
        };
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'UPDATE_TICKET_SERVICE_ERROR',
            user: user.user_id,
            ticketId
        });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};