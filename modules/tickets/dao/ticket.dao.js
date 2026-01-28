'use strict';

const dbHandler = require('../../../database/mysql');
const logging = require('../../../logging/logging');


exports.findApprovedEngineer = async (apiReference) => {
    logging.log(apiReference, { EVENT: 'FINDING_APPROVED_ENGINEER' });

    const query = `
        SELECT user_id
        FROM users
        WHERE user_type = 'ENGINEER'
          AND user_status = 'APPROVED'
        ORDER BY created_at ASC
        LIMIT 1
    `;

    const result = await dbHandler.executeQuery(
        apiReference,
        'FIND_APPROVED_ENGINEER',
        query,
        []
    );

    logging.log(apiReference, {
        EVENT: 'FIND_ENGINEER_RESULT',
        found: !!result?.length,
        engineer_id: result?.[0]?.user_id
    });

    return result;
};

exports.createTicket = async (apiReference, payload) => {
    logging.log(apiReference, {
        EVENT: 'CREATING_TICKET_DAO_START',
        payload: {
            title: payload.title,
            reporter: payload.reporter,
            assignee: payload.assignee,
            status: payload.status,
            priority: payload.ticket_priority
        }
    });

    const query = `INSERT INTO tickets SET ?`;

    const result = await dbHandler.executeQuery(
        apiReference,
        'CREATE_TICKET',
        query,
        [payload]
    );

    if (result?.ERROR) {
        logging.logError(apiReference, new Error(result.ERROR), {
            EVENT: 'CREATE_TICKET_DB_ERROR',
            reporter: payload.reporter
        });
        return result;
    }

    logging.log(apiReference, {
        EVENT: 'CREATE_TICKET_DAO_COMPLETE',
        insert_id: result.insertId,
        affected_rows: result.affectedRows
    });

    return result;
};

exports.getHighestPriority = async (apiReference) => {
    logging.log(apiReference, {
        EVENT: 'GETTING_HIGHEST_PRIORITY',
    });

    let query = `Select MAX(ticket_priority) from tickets`;

    const result = await dbHandler.executeQuery(
        apiReference,
        'GET_HIGHEST_PRIORITY',
        query,
        {}
    );

    return result;
}

exports.fetchTickets = async (apiReference, opts = {}) => {
    logging.log(apiReference, {
        EVENT: 'FETCH_TICKETS_DAO_START',
        filters: opts
    });

    let query = `
        SELECT *
        FROM tickets
        WHERE 1 = 1
    `;
    const values = [];

    // ---- Identifiers ----
    if (opts.id) {
        query += ` AND id = ?`;
        values.push(opts.id);
    }

    // ---- User based filters ----
    if (opts.reporter) {
        query += ` AND reporter = ?`;
        values.push(opts.reporter);
    }

    if (opts.assignee) {
        query += ` AND assignee = ?`;
        values.push(opts.assignee);
    }

    // Engineer view: tickets where user is reporter OR assignee
    if (opts.user_id && opts.includeReporterAndAssignee) {
        query += ` AND (assignee = ? OR reporter = ?)`;
        values.push(opts.user_id, opts.user_id);
    }

    // ---- Ticket attributes ----
    if (opts.status) {
        query += ` AND status = ?`;
        values.push(opts.status);
    }

    if (opts.priority) {
        query += ` AND ticket_priority = ?`;
        values.push(opts.priority);
    }

    // ---- Sorting ----
    query += ` ORDER BY created_at DESC`;

    // ---- Pagination ----
    if (opts.limit) {
        query += ` LIMIT ?`;
        values.push(Number(opts.limit));
    }

    if (opts.offset) {
        query += ` OFFSET ?`;
        values.push(Number(opts.offset));
    }

    const result = await dbHandler.executeQuery(
        apiReference,
        'FETCH_TICKETS',
        query,
        values
    );

    logging.log(apiReference, {
        EVENT: 'FETCH_TICKETS_DAO_COMPLETE',
        count: result?.length || 0
    });

    return result;
};

exports.updateTicket = async (apiReference, updateObj, ticketId) => {
    logging.log(apiReference, {
        EVENT: 'UPDATE_TICKET_DAO_START',
        ticketId,
        updates: updateObj
    });

    const query = `
        UPDATE tickets
        SET ?
        WHERE id = ?
    `;

    const result = await dbHandler.executeQuery(
        apiReference,
        'UPDATE_TICKET',
        query,
        [updateObj, ticketId]
    );

    if (result?.ERROR) {
        logging.logError(apiReference, new Error(result.ERROR), {
            EVENT: 'UPDATE_TICKET_DB_ERROR',
            ticketId
        });
        return result;
    }

    logging.log(apiReference, {
        EVENT: 'UPDATE_TICKET_DAO_COMPLETE',
        affected_rows: result?.affectedRows || 0
    });

    return result;
};