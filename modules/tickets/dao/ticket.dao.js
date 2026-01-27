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

exports.fetchTicketById = async (apiReference, ticketId, user = null) => {
    logging.log(apiReference, {
        EVENT: 'FETCH_TICKET_BY_ID_DAO_START',
        ticketId,
        user_id: user?.user_id
    });

    const query = `
        SELECT *
        FROM tickets
        WHERE id = ?
        LIMIT 1
    `;

    const result = await dbHandler.executeQuery(
        apiReference,
        'FETCH_TICKET_BY_ID',
        query,
        [ticketId]
    );

    logging.log(apiReference, {
        EVENT: 'FETCH_TICKET_BY_ID_DAO_COMPLETE',
        found: !!result?.length,
        ticket_id: result?.[0]?.id
    });

    return result;
};

exports.fetchAllTickets = async (apiReference) => {
    logging.log(apiReference, { EVENT: 'FETCH_ALL_TICKETS_DAO_START' });

    const query = `
        SELECT *
        FROM tickets
        ORDER BY created_at DESC
    `;

    const result = await dbHandler.executeQuery(
        apiReference,
        'FETCH_ALL_TICKETS',
        query,
        []
    );

    logging.log(apiReference, {
        EVENT: 'FETCH_ALL_TICKETS_DAO_COMPLETE',
        count: result?.length || 0
    });

    return result;
};

exports.fetchEngineerTickets = async (apiReference, userId) => {
    logging.log(apiReference, {
        EVENT: 'FETCH_ENGINEER_TICKETS_DAO_START',
        userId
    });

    const query = `
        SELECT *
        FROM tickets
        WHERE assignee = ?
           OR reporter = ?
        ORDER BY created_at DESC
    `;

    const result = await dbHandler.executeQuery(
        apiReference,
        'FETCH_ENGINEER_TICKETS',
        query,
        [userId, userId]
    );

    logging.log(apiReference, {
        EVENT: 'FETCH_ENGINEER_TICKETS_DAO_COMPLETE',
        count: result?.length || 0
    });

    return result;
};

exports.fetchCustomerTickets = async (apiReference, userId) => {
    logging.log(apiReference, {
        EVENT: 'FETCH_CUSTOMER_TICKETS_DAO_START',
        userId
    });

    const query = `
        SELECT *
        FROM tickets
        WHERE reporter = ?
        ORDER BY created_at DESC
    `;

    const result = await dbHandler.executeQuery(
        apiReference,
        'FETCH_CUSTOMER_TICKETS',
        query,
        [userId]
    );

    logging.log(apiReference, {
        EVENT: 'FETCH_CUSTOMER_TICKETS_DAO_COMPLETE',
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