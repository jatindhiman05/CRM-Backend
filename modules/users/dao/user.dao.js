'use strict';

const dbHandler = require('../../../database/mysql');
const logging = require('../../../logging/logging');

exports.fetchAllUsers = async (apiReference, filters) => {
    let whereClause = 'WHERE 1=1';
    const values = [];

    logging.log(apiReference, {
        EVENT: 'FETCH_ALL_USERS_DAO_START',
        filters: {
            user_type: filters.user_type,
            user_status: filters.user_status,
            search: filters.search,
            page: filters.page,
            limit: filters.limit
        }
    });

    if (filters.user_type) {
        whereClause += ' AND user_type = ?';
        values.push(filters.user_type);
    }

    if (filters.user_status) {
        whereClause += ' AND user_status = ?';
        values.push(filters.user_status);
    }

    if (filters.search) {
        whereClause += ' AND (email LIKE ? OR name LIKE ?)';
        values.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    
    const query = `
    SELECT 
    id,
    name,
    user_id,
    email,
    user_type,
    user_status,
    created_at
    FROM users
    ${whereClause}
    ORDER BY ${filters.sort_by} ${filters.order}
    LIMIT ?
    OFFSET ?
    `;
    
    let limit = filters.limit ?? 10;
    const offset = (filters.page - 1) * limit;
    values.push(limit, offset);

    logging.log(apiReference, {
        EVENT: 'EXECUTING_USERS_QUERY',
        query_snippet: query.substring(0, 100) + '...',
        values_count: values.length
    });

    const result = await dbHandler.executeQuery(
        apiReference,
        'FETCH_ALL_USERS',
        query,
        values
    );

    logging.log(apiReference, {
        EVENT: 'FETCH_ALL_USERS_DAO_COMPLETE',
        count: result?.length || 0
    });

    return result;
};

exports.fetchUserByUserId = async (apiReference, user_id) => {
    logging.log(apiReference, {
        EVENT: 'FETCH_USER_BY_ID_DAO_START',
        user_id
    });

    const query = `
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
        WHERE user_id = ?
        LIMIT 1
    `;

    const result = await dbHandler.executeQuery(
        apiReference,
        'FETCH_USER_BY_ID',
        query,
        [user_id]
    );

    logging.log(apiReference, {
        EVENT: 'FETCH_USER_BY_ID_DAO_COMPLETE',
        found: !!result?.length
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