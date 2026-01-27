'use strict';

const router = require('express').Router();
const { authenticateUser } = require('../../middlewares/authenticateUser');

/* controllers */
const createTicketController = require('./controllers/createTicket.controller');
const updateTicketController = require('./controllers/updateTicket.controller');
const getTicketByIdController = require('./controllers/getTicketById.controller');
const getAllTicketsController = require('./controllers/getAllTickets.controller');

/* validators */
const createTicketValidator = require('./validators/createTicket.validator');
const updateTicketValidator = require('./validators/updateTicket.validator');
const getTicketValidator = require('./validators/getTicket.validator');

// Create ticket
router.post(
    '/',
    authenticateUser,
    createTicketValidator.validate,
    createTicketController.createTicket
);

// Get all tickets
router.get(
    '/',
    authenticateUser,
    getAllTicketsController.getAllTickets
);

// Get ticket by ID
router.get(
    '/:ticket_id',
    authenticateUser,
    getTicketValidator.validate,
    getTicketByIdController.getTicketById
);

// Update ticket
router.put(
    '/:ticket_id',
    authenticateUser,
    updateTicketValidator.validate,
    updateTicketController.updateTicket
);

module.exports = router;