'use strict';

const mysqlLib = require('./mysql');
const dbProperties = require('./dbProperties');

async function initialize(apiReference) {
    const mysqlCon = await mysqlLib.initialize(
        apiReference,
        dbProperties.mysql.master
    );

    return { mysqlCon };
}

module.exports = { initialize };
