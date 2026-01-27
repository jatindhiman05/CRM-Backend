'use strict';

/**
 * Module names for API reference
 */
exports.modules = {
    AUTH: {
        REGISTER: "auth",
        LOGIN: "auth"
    },
    TICKET: {
        CREATE: "ticket",
        UPDATE: "ticket",
        CLOSE: "ticket",
        ASSIGN: "ticket",
        SEARCH: "ticket",
        GET_ONE: "ticket",
        GET_ALL: "ticket"
    },
    USER: {
        FETCH_ALL: "user",
        FETCH_ONE: "user",
        UPDATE: "user"
    }
};

/**
 * User types
 */
exports.userTypes = {
    CUSTOMER: "CUSTOMER",
    ENGINEER: "ENGINEER",
    ADMIN: "ADMIN"
};

/**
 * User statuses
 */
exports.userStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    INACTIVE: "INACTIVE",
    BLOCKED: "BLOCKED"
};

/**
 * Ticket statuses
 */
exports.ticketStatus = {
    OPEN: "OPEN",
    IN_PROGRESS: "IN_PROGRESS",
    BLOCKED: "BLOCKED",
    CLOSED: "CLOSED"
};

/**
 * Comprehensive response messages
 */
exports.responseMessages = {
    // Success Messages
    SUCCESS: "Success",
    FAILURE: "Something went wrong. Please try again.",

    // Auth & User Messages
    REGISTER_SUCCESS: "User registered successfully.",
    LOGIN_SUCCESS: "Login successful.",

    USER_ALREADY_REGISTERED: "User already registered. Please login.",
    USER_NOT_FOUND: "User not found.",
    USER_PENDING_APPROVAL: "User registration pending admin approval.",
    USER_REJECTED: "User registration rejected by admin.",
    USER_INACTIVE: "User is inactive or blocked by admin.",

    // Credential Messages
    INVALID_CREDENTIALS: "Invalid credentials.",
    INVALID_AUTH_KEY: "Invalid or expired token.",

    // Authorization Messages
    UNAUTHORIZED_ACCESS: "You are not authorized to perform this action.",

    // Ticket Messages
    TICKET_CREATED: "Ticket created successfully.",
    TICKET_UPDATED: "Ticket updated successfully.",
    TICKET_CLOSED: "Ticket closed successfully.",
    TICKET_NOT_FOUND: "Ticket not found.",
    TICKET_ALREADY_CLOSED: "Ticket is already closed.",

    // Update Messages
    MISSING_PARAMETER: "Required parameters are missing.",
    NOTHING_TO_UPDATE: "No valid fields to update.",
    UPDATE_FAILED: "Failed to update resource.",

    // Validation Messages
    ALREADY_EXISTS: "Resource already exists."
};

/**
 * HTTP Response Status Codes
 */
exports.responseStatus = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SESSION_EXPIRED: 440
};