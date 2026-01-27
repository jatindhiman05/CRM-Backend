'use strict';

const ticketDao = require('../dao/ticket.dao');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.createTicket = async (apiReference, user, data) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'CREATE_TICKET_SERVICE_START',
            user: user.user_id,
            user_type: user.user_type,
            title: data.title
        });

        // auto assign engineer
        const engineer = await ticketDao.findApprovedEngineer(apiReference);

        const assignee = engineer?.length ? engineer[0].user_id : null;

        logging.log(apiReference, {
            EVENT: 'ENGINEER_ASSIGNMENT',
            assignee,
            available_engineers: engineer?.length || 0
        });

        const payload = {
            title: data.title,
            description: data.description,
            ticket_priority: data.ticket_priority || 4,
            status: constants.ticketStatus.OPEN,
            reporter: user.user_id,
            assignee: assignee
        };

        logging.log(apiReference, {
            EVENT: 'TICKET_PAYLOAD',
            payload: {
                title: payload.title,
                reporter: payload.reporter,
                assignee: payload.assignee,
                priority: payload.ticket_priority
            }
        });

        const result = await ticketDao.createTicket(apiReference, payload);

        if (result?.ERROR) {
            logging.logError(apiReference, new Error(result.ERROR), {
                EVENT: 'TICKET_CREATION_DB_ERROR'
            });
            response.error = constants.responseMessages.FAILURE;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'TICKET_CREATED_SUCCESS',
            ticket_id: result.insertId,
            assignee: assignee
        });

        response.success = true;
        response.data = {
            ticket_id: result.insertId,
            assignee: assignee
        };

        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'CREATE_TICKET_SERVICE_ERROR',
            user: user.user_id
        });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};