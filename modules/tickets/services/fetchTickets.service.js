'use strict';

const ticketDao = require('../dao/ticket.dao');
const logging = require('../../../logging/logging');
const constants = require('../../../responses/responseConstants');

exports.fetchTickets = async (apiReference, user, params = {}) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'FETCH_TICKETS_SERVICE_START',
            user: user.user_id,
            user_type: user.user_type,
            params
        });

        const opts = {};

        // Single ticket ID (from route param) - takes precedence
        if (params.ticket_id) opts.id = Number(params.ticket_id);

        // Filters from query
        if (params.reporter) opts.reporter = Number(params.reporter);
        if (params.assignee) opts.assignee = Number(params.assignee);
        if (params.status) opts.status = params.status;
        if (params.priority) opts.priority = Number(params.priority);
        if (params.limit) opts.limit = Number(params.limit);
        if (params.offset) opts.offset = Number(params.offset);

        // 🔐 ROLE-BASED ACCESS CONTROL
        if (opts.id) {
            // If fetching specific ticket by ID, no role filters needed
            // Authorization will be handled in service/controller
        } else {
            // For list views, apply role-based filters
            switch (user.user_type) {
                case constants.userTypes.ADMIN:
                    // Admin sees ALL tickets - no filters
                    logging.log(apiReference, {
                        EVENT: 'ADMIN_FETCH_TICKETS',
                        message: 'Admin fetching all tickets'
                    });
                    break;

                case constants.userTypes.ENGINEER:
                    // Engineer sees tickets they reported OR are assigned to them
                    logging.log(apiReference, {
                        EVENT: 'ENGINEER_FETCH_TICKETS',
                        message: 'Engineer fetching their tickets',
                        user_id: user.user_id
                    });
                    opts.user_id = user.user_id;
                    opts.includeReporterAndAssignee = true;
                    break;

                case constants.userTypes.CUSTOMER:
                    // Customer ONLY sees tickets they reported
                    logging.log(apiReference, {
                        EVENT: 'CUSTOMER_FETCH_TICKETS',
                        message: 'Customer fetching their own tickets',
                        user_id: user.user_id
                    });
                    opts.reporter = user.user_id;
                    break;

                default:
                    logging.logError(apiReference, {
                        EVENT: 'UNKNOWN_USER_TYPE',
                        user_type: user.user_type,
                        user_id: user.user_id
                    });
                    break;
            }
        }

        const tickets = await ticketDao.fetchTickets(apiReference, opts);

        response.success = true;
        response.data = tickets || [];

        logging.log(apiReference, {
            EVENT: 'FETCH_TICKETS_SERVICE_COMPLETE',
            count: response.data.length,
            user_type: user.user_type,
            filters_applied: opts
        });

        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'FETCH_TICKETS_SERVICE_ERROR',
            user: user.user_id
        });
        response.error = constants.responseMessages.FAILURE;
        return response;
    }
};