'use strict';

const passwordService = require('../services/pwdServices');
const startupDao = require('./startup.dao');
const logging = require('../logging/logging');

const ensureDefaultAdmin = async (apiReference, mysql) => {
    const adminExists = await startupDao.fetchAnyAdmin(mysql); 

    if (adminExists) {
        logging.log(apiReference, 'Admin already exists. Skipping bootstrap.');
        return;
    }

    const admin = {
        name: 'System Admin',
        userId: 'admin',
        email: 'admin@crm.com',
        password: await passwordService.encrypt('Admin@123'),
        userType: 'ADMIN',
        userStatus: 'APPROVED'
    };

    await startupDao.createAdmin(mysql, admin);

    logging.log(apiReference, {
        EVENT: 'DEFAULT_ADMIN_CREATED',
        userId: admin.userId,
        email: admin.email
    });
}; 

module.exports = { ensureDefaultAdmin };
