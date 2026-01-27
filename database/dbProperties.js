'use strict';

const config = require('config');

exports.mysql = {
    master: {
        host: process.env.DB_HOST || config.get('DB.mysql.host'),
        user: process.env.DB_USERNAME || config.get('DB.mysql.user'),
        password: process.env.DB_PASSWORD || config.get('DB.mysql.password'),
        database: process.env.DB_NAME || config.get('DB.mysql.database'),
        namedPlaceholders:
            process.env.NAMED_PLACEHOLDERS === 'false' ? false : true,
        connectionLimit: Number(process.env.DB_POOL_SIZE) || 10
    }
};
