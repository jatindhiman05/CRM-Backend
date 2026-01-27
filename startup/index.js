'use strict';

const config = require('config');
const logging = require('../logging/logging');
const db = require('../database');
const startupService = require('./startup.service');

const PORT = config.get('PORT');

const apiReference = {
    module: 'startup',
    api: 'initialize'
};


(async () => {
    try {
        logging.log(apiReference, 'Starting CRM server...');

        const { mysqlCon } = await db.initialize(apiReference);
        app.locals.mysql = mysqlCon;

        logging.log(apiReference, 'Database connected');

        await startupService.ensureDefaultAdmin(apiReference, mysqlCon);

        app.listen(PORT, () => {
            console.log(`SERVER RUNNING ON PORT ${PORT}`);
        });

    } catch (err) {
        logging.logError(apiReference, {
            EVENT: 'STARTUP_FAILURE',
            ERROR: err.message
        });
        process.exit(1);
    }
})();
