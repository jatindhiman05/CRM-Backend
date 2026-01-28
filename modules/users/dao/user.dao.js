'use strict';

const dbHandler = require('../../../database/mysql');
const logging = require('../../../logging/logging');

exports.fetchUsers = async (apiReference, opts = {}) => {
    logging.log(apiReference, {
        EVENT: 'FETCH_USERS_DAO_START',
        opts
    });

    let query = `
        SELECT
            id,
            name,
            user_id,
            email,
            user_type,
            user_status,
            created_at,
            updated_at
        FROM users
        WHERE 1 = 1
    `;

    const values = [];

    if (opts.user_id) {
        query += ` AND user_id = ?`;
        values.push(opts.user_id);
    }

    if (opts.user_type) {
        query += ` AND user_type = ?`;
        values.push(opts.user_type);
    }

    if (opts.user_status) {
        query += ` AND user_status = ?`;
        values.push(opts.user_status);
    }

    if (opts.search) {
        query += ` AND (email LIKE ? OR name LIKE ?)`;
        values.push(`%${opts.search}%`, `%${opts.search}%`);
    }

    const allowedSortColumns = [
        'created_at',
        'updated_at',
        'name',
        'email',
        'user_type',
        'user_status'
    ];

    const sortBy = allowedSortColumns.includes(opts.sort_by)
        ? opts.sort_by
        : 'created_at';

    const order = opts.order === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortBy} ${order}`;

    if (!opts.user_id) {
        const limit = Number(opts.limit) || 10;
        const page = Number(opts.page) || 1;
        const offset = (page - 1) * limit;

        query += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);
    } else {
        query += ` LIMIT 1`;
    }

    logging.log(apiReference, {
        EVENT: 'EXECUTING_FETCH_USERS_QUERY',
        query_snippet: query.substring(0, 120) + '...',
        values_count: values.length
    });

    const result = await dbHandler.executeQuery(
        apiReference,
        'FETCH_USERS',
        query,
        values
    );

    logging.log(apiReference, {
        EVENT: 'FETCH_USERS_DAO_COMPLETE',
        count: result?.length || 0
    });

    return result;
};

exports.updateUser = async (apiReference, updateObj, user_id) => {
    logging.log(apiReference, {
        EVENT: 'UPDATE_USER_DAO_START',
        user_id,
        update_fields: Object.keys(updateObj)
    });

    const query = `
        UPDATE users
        SET ?
        WHERE user_id = ?
    `;

    const result = await dbHandler.executeQuery(
        apiReference,
        'UPDATE_USER',
        query,
        [updateObj, user_id]
    );

    logging.log(apiReference, {
        EVENT: 'UPDATE_USER_DAO_COMPLETE',
        affected_rows: result?.affectedRows || 0
    });

    return result;
};
