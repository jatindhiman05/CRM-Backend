'use strict';

const responseConstants = require('./responseConstants');
const logging = require('../logging/logging');

/**
 * Base response handler
 */
const sendResponse = (res, payload, apiReference = null) => {
    const statusCode = payload.status || responseConstants.responseStatus.SUCCESS;

    // Log response for monitoring
    if (apiReference && statusCode >= 400) {
        const logData = {
            EVENT: 'API_ERROR_RESPONSE',
            status: statusCode,
            path: res.req?.originalUrl,
            method: res.req?.method,
            message: payload.message,
            error: payload.error || payload.message
        };

        if (statusCode >= 500) {
            logging.logError(apiReference, new Error(payload.message), logData);
        } else {
            logging.logError(apiReference, logData);
        }
    }

    // Construct response object
    const responseObj = {
        success: statusCode < 400,
        message: payload.message,
        status: statusCode,
        data: payload.data || {},
        timestamp: new Date().toISOString()
    };

    // Add meta data if present
    if (payload.meta) {
        responseObj.meta = payload.meta;
    }

    // Send response
    res.status(statusCode).json(responseObj);
};

/**
 * Success response (200)
 */
const success = (res, data, message, apiReference = null) => {
    const payload = {
        status: responseConstants.responseStatus.SUCCESS,
        message: message || responseConstants.responseMessages.SUCCESS,
        data
    };

    if (apiReference) {
        logging.log(apiReference, {
            EVENT: 'API_SUCCESS_RESPONSE',
            message: payload.message,
            data_type: Array.isArray(data) ? 'array' : typeof data,
            data_length: Array.isArray(data) ? data.length : 1
        });
    }

    sendResponse(res, payload, apiReference);
};

/**
 * Created response (201)
 */
const created = (res, data, message, apiReference = null) => {
    const payload = {
        status: responseConstants.responseStatus.CREATED,
        message: message || responseConstants.responseMessages.SUCCESS,
        data
    };

    if (apiReference) {
        logging.log(apiReference, {
            EVENT: 'API_CREATED_RESPONSE',
            message: payload.message,
            created_id: data?.id || data?.ticket_id || data?.user_id
        });
    }

    sendResponse(res, payload, apiReference);
};

/**
 * Bad Request response (400)
 */
const badRequest = (res, data, message, apiReference = null) => {
    const payload = {
        status: responseConstants.responseStatus.BAD_REQUEST,
        message: message || responseConstants.responseMessages.MISSING_PARAMETER,
        data
    };

    sendResponse(res, payload, apiReference);
};

/**
 * Unauthorized response (401)
 */
const unauthorized = (res, data, message, apiReference = null) => {
    const payload = {
        status: responseConstants.responseStatus.UNAUTHORIZED,
        message: message || responseConstants.responseMessages.INVALID_CREDENTIALS,
        data
    };

    sendResponse(res, payload, apiReference);
};

/**
 * Forbidden response (403)
 */
const forbidden = (res, data, message, apiReference = null) => {
    const payload = {
        status: responseConstants.responseStatus.FORBIDDEN,
        message: message || responseConstants.responseMessages.UNAUTHORIZED_ACCESS,
        data
    };

    sendResponse(res, payload, apiReference);
};

/**
 * Not Found response (404)
 */
const notFound = (res, data, message, apiReference = null) => {
    const payload = {
        status: responseConstants.responseStatus.NOT_FOUND,
        message: message || responseConstants.responseMessages.USER_NOT_FOUND,
        data
    };

    sendResponse(res, payload, apiReference);
};

/**
 * Conflict response (409)
 */
const conflict = (res, data, message, apiReference = null) => {
    const payload = {
        status: responseConstants.responseStatus.CONFLICT,
        message: message || responseConstants.responseMessages.ALREADY_EXISTS,
        data
    };

    sendResponse(res, payload, apiReference);
};

/**
 * Internal Server Error response (500)
 */
const failure = (res, data, message, apiReference = null) => {
    const payload = {
        status: responseConstants.responseStatus.INTERNAL_ERROR,
        message: message || responseConstants.responseMessages.FAILURE,
        data
    };

    sendResponse(res, payload, apiReference);
};

/**
 * Session Expired response (440)
 */
const sessionExpired = (res, data, apiReference = null) => {
    const payload = {
        status: responseConstants.responseStatus.SESSION_EXPIRED,
        message: responseConstants.responseMessages.INVALID_AUTH_KEY,
        data
    };

    sendResponse(res, payload, apiReference);
};

module.exports = {
    success,
    created,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    failure,
    sessionExpired
};