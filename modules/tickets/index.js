'use strict';

const router = require('express').Router();
const { authenticateUser } = require('../../middlewares/authenticateUser');
const { authorizeAdmin } = require('../../middlewares/authorizeAdmin');

/* controllers */
const createTicketController = require('./controllers/createTicket.controller');
const updateTicketController = require('./controllers/updateTicket.controller');
const fetchTicketsController = require('./controllers/fetchTickets.controller');

/* validators */
const createTicketValidator = require('./validators/createTicket.validator');
const updateTicketValidator = require('./validators/updateTicket.validator');
const fetchTicketsValidator = require('./validators/fetchTickets.validator');

router.post('/', authenticateUser, createTicketValidator.validate, createTicketController.createTicket);

router.put('/:ticket_id', authenticateUser, updateTicketValidator.validate, updateTicketController.updateTicket);

router.put( '/:ticket_id/:before_ticket_id/:after_ticket_id', authenticateUser, authorizeAdmin, updateTicketValidator.validate, updateTicketController.updateTicket);

router.get('/', authenticateUser, fetchTicketsValidator.validate, fetchTicketsController.fetchTickets);

router.get('/:ticket_id', authenticateUser, fetchTicketsValidator.validate, fetchTicketsController.fetchTickets);

module.exports = router;
