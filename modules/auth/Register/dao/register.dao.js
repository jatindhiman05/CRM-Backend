'use strict';

const logging = require('../../../../logging/logging');
const dbHandler = require('../../../../database/mysql');

exports.fetchUser = async (apiReference, whereObj) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'FETCH_USER_FOR_REGISTER_DAO_START',
            where_conditions: whereObj
        });

        const query = `
            SELECT id, email, user_id
            FROM users
            WHERE ?
            LIMIT 1
        `;

        const result = await dbHandler.executeQuery(
            apiReference,
            'FETCH_USER_FOR_REGISTER',
            query,
            [whereObj]
        );

        if (result?.ERROR) {
            logging.logError(apiReference, new Error(result.ERROR), {
                EVENT: 'FETCH_USER_REGISTER_DB_ERROR',
                where: whereObj
            });
            response.error = result.ERROR;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'FETCH_USER_FOR_REGISTER_DAO_COMPLETE',
            found: !!result?.length,
            user_id: result?.[0]?.user_id
        });

        response.success = true;
        response.data = result;
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'FETCH_USER_FOR_REGISTER_DAO_ERROR',
            where: whereObj
        });
        response.error = err.message;
        return response;
    }
};

exports.createUser = async (apiReference, insertObj) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'CREATE_USER_DAO_START',
            email: insertObj.email,
            user_type: insertObj.user_type
        });

        const query = `INSERT INTO users SET ?`;

        const result = await dbHandler.executeQuery(
            apiReference,
            'CREATE_USER',
            query,
            [insertObj]
        );

        if (result?.ERROR) {
            logging.logError(apiReference, new Error(result.ERROR), {
                EVENT: 'CREATE_USER_DB_ERROR',
                email: insertObj.email
            });
            response.error = result.ERROR;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'CREATE_USER_DAO_COMPLETE',
            insert_id: result.insertId,
            affected_rows: result.affectedRows
        });

        response.success = true;
        response.data = result;
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'CREATE_USER_DAO_ERROR',
            email: insertObj.email
        });
        response.error = err.message;
        return response;
    }
};