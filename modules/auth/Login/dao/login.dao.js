'use strict';

const logging = require('../../../../logging/logging');
const dbHandler = require('../../../../database/mysql');

exports.fetchUser = async (apiReference, whereObj) => {
    const response = { success: false };

    try {
        logging.log(apiReference, {
            EVENT: 'FETCH_USER_FOR_LOGIN_DAO_START',
            where_conditions: whereObj
        });

        const query = `
            SELECT 
                id,
                name,
                user_id,
                email,
                password,
                user_type,
                user_status,
                created_at
            FROM users
            WHERE ?
            LIMIT 1
        `;

        const result = await dbHandler.executeQuery(
            apiReference,
            'LOGIN_FETCH_USER',
            query,
            [whereObj]
        );

        if (result?.ERROR) {
            logging.logError(apiReference, new Error(result.ERROR), {
                EVENT: 'LOGIN_FETCH_USER_DB_ERROR',
                where: whereObj
            });
            response.error = result.ERROR;
            return response;
        }

        logging.log(apiReference, {
            EVENT: 'FETCH_USER_FOR_LOGIN_DAO_COMPLETE',
            found: !!result?.length,
            user_id: result?.[0]?.user_id
        });

        response.success = true;
        response.data = result || [];
        return response;

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'FETCH_USER_FOR_LOGIN_DAO_ERROR',
            where: whereObj
        });
        response.error = err.message;
        return response;
    }
};