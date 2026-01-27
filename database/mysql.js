'use strict';

const mysql = require('mysql2/promise');
const logging = require('../logging/logging');

let pool = null;
const MAX_RETRIES = 3;

const initialize = async (apiReference, config, retry = 0) => {
    if (pool) return pool;

    try {
        pool = mysql.createPool({
            ...config,
            waitForConnections: true
        });

        logging.log(apiReference, 'MySQL pool initialized');
        return pool;

    } catch (err) {
        logging.logError(apiReference, {
            EVENT: 'MYSQL_INIT_ERROR',
            RETRY: retry,
            ERROR: err.message
        });

        if (retry >= MAX_RETRIES) throw err;

        await new Promise(r => setTimeout(r, 1000 * (retry + 1)));
        return initialize(apiReference, config, retry + 1);
    }
};

const executeQuery = async (apiReference, event, query, params = []) => {
    if (!pool) throw new Error('MySQL pool not initialized');

    try {
        const [result] = await pool.query(query, params);

        logging.log(apiReference, {
            EVENT: event,
            ROWS: Array.isArray(result) ? result.length : 1
        });

        return result;

    } catch (err) {
        logging.logError(apiReference, {
            EVENT: event,
            ERROR: err.code || err.message
        });

        if (err.code === 'ER_LOCK_DEADLOCK') {
            await new Promise(r => setTimeout(r, 50));
            return executeQuery(apiReference, event, query, params);
        }

        if (err.code === 'ER_DUP_ENTRY') {
            return { success: false, code: 'DUPLICATE_ENTRY' };
        }

        throw err;
    }
};

module.exports = { initialize, executeQuery };
