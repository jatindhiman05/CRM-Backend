'use strict';

const router = require('express').Router();
const { authenticateUser } = require('../../middlewares/authenticateUser');

/* controllers */
const createTicketController = require('./controllers/createTicket.controller');
const updateTicketController = require('./controllers/updateTicket.controller');
const fetchTicketsController = require('./controllers/fetchTickets.controller');

/* validators */
const createTicketValidator = require('./validators/createTicket.validator');
const updateTicketValidator = require('./validators/updateTicket.validator');
const fetchTicketsValidator = require('./validators/fetchTickets.validator');

// Create ticket
router.post(
    '/',
    authenticateUser,
    createTicketValidator.validate,
    createTicketController.createTicket
);

// Update ticket
router.put(
    '/:ticket_id',
    authenticateUser,
    updateTicketValidator.validate,
    updateTicketController.updateTicket
);

// Fetch all / filtered tickets
router.get(
    '/',
    authenticateUser,
    fetchTicketsValidator.validate,
    fetchTicketsController.fetchTickets
);

// Fetch ticket by ID
router.get(
    '/:ticket_id',
    authenticateUser,
    fetchTicketsValidator.validate,
    fetchTicketsController.fetchTickets
);

module.exports = router;