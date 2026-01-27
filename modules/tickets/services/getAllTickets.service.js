'use strict';

const ticketDao = require('../dao/ticket.dao');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.getAllTickets = async (apiReference, user) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_ALL_TICKETS_SERVICE_START',
            user: user.user_id,
            user_type: user.user_type
        });

        let tickets;

        switch (user.user_type) {
            case constants.userTypes.ADMIN:
                logging.log(apiReference, { EVENT: 'FETCHING_ALL_TICKETS_FOR_ADMIN' });
                tickets = await ticketDao.fetchAllTickets(apiReference);
                break;

            case constants.userTypes.ENGINEER:
                logging.log(apiReference, { EVENT: 'FETCHING_ENGINEER_TICKETS' });
                tickets = await ticketDao.fetchEngineerTickets(
                    apiReference,
                    user.user_id
                );
                break;

            case constants.userTypes.CUSTOMER:
                logging.log(apiReference, { EVENT: 'FETCHING_CUSTOMER_TICKETS' });
                tickets = await ticketDao.fetchCustomerTickets(
                    apiReference,
                    user.user_id
                );
                break;

            default:
                logging.logError(apiReference, {
                    EVENT: 'INVALID_USER_TYPE',
                    user_type: user.user_type
                });
                response.error = constants.responseMessages.UNAUTHORIZED_ACCESS;
                return response;
        }

        if (!Array.isArray(tickets)) {
            logging.logError(apiReference, new Error('Invalid tickets response'), {
                EVENT: 'INVALID_TICKETS_RESPONSE',
                tickets_type: typeof tickets
            });
            response.error = constants.responseMessages.FAILURE;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'GET_ALL_TICKETS_SERVICE_SUCCESS',
            count: tickets.length
        });

        response.success = true;
        response.data = tickets;
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_ALL_TICKETS_SERVICE_ERROR',
            user: user.user_id
        });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};