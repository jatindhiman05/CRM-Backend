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

        // Single ticket ID (from route param)
        if (params.ticket_id) opts.id = Number(params.ticket_id);

        // Filters from query
        if (params.id) opts.id = Number(params.id); // optional, supports query ?id=
        if (params.reporter) opts.reporter = Number(params.reporter);
        if (params.assignee) opts.assignee = Number(params.assignee);
        if (params.status) opts.status = params.status;
        if (params.priority) opts.priority = Number(params.priority);
        if (params.limit) opts.limit = Number(params.limit);
        if (params.offset) opts.offset = Number(params.offset);

        // Engineer view: include tickets where user is reporter OR assignee
        if (user.user_type === constants.userTypes.ENGINEER) {
            opts.user_id = user.user_id;
            opts.includeReporterAndAssignee = true;
        }

        const tickets = await ticketDao.fetchTickets(apiReference, opts);

        response.success = true;
        response.data = tickets || [];

        logging.log(apiReference, {
            EVENT: 'FETCH_TICKETS_SERVICE_COMPLETE',
            count: response.data.length
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
