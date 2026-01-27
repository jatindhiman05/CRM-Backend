'use strict';

const moment = require('moment');

const fileSwitches = {
    startup: true,
    auth: true,
    user: true,
    ticket: true,
    notification: true
};

const modules = {
    startup: {
        initialize: true
    },
    auth: {
        register: true,
        login: true,
        approveUser: true,
        rejectUser: true
    },
    user: {
        getAllUsers: true,
        getUserById: true,
        updateUserStatus: true
    },
    ticket: {
        createTicket: true,
        updateTicket: true,
        closeTicket: true,
        assignTicket: true,
        searchTicket: true,
        getMyTickets: true,
        getAllTickets: true,
        getTicketById: true
    },
    notification: {
        publishEvent: true,
        consumeEvent: true,
        sendEmail: true
    }
};

const log = (apiReference, logData) => {
    if (apiReference && apiReference.module && apiReference.api && fileSwitches &&
        fileSwitches[apiReference.module] == true && modules && modules[apiReference.module] &&
        modules[apiReference.module][apiReference.api] == true) {

        try {
            logData = JSON.stringify(logData);
        } catch (exception) {
            console.error('>>>>> EXCEPTION <<<<', exception);
        }

        console.log("-->" + moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS') + " :----: " +
            apiReference.module + " :=: " + apiReference.api + " :=: " + logData);
    }
};

const logError = (apiReference, logData) => {
    if (apiReference && apiReference.module && apiReference.api) {

        try {
            logData = JSON.stringify(logData);
        } catch (exception) {
            // Silent catch for stringify errors
        }

        console.error("-->" + moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS') + " :----: " +
            apiReference.module + " :=: " + apiReference.api + " :=: " + logData);
    }
};

exports.log = log;
exports.logError = logError;