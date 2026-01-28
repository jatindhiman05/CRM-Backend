'use strict';

const Joi = require('joi');
const validators = require('../../../validators/joiValidators');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.validate = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.TICKET.FETCH,
        api: 'fetchTickets'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'FETCH_TICKETS_VALIDATION_START',
            user: req.user?.user_id,
            query: req.query,
            params: req.params
        });

        // Merge params and query for validation
        const dataToValidate = { ...req.query, ticket_id: req.params.ticket_id };

        const schema = Joi.object({
            ticket_id: Joi.number().integer().positive()
                .messages({
                    'number.base': 'Ticket ID must be a number',
                    'number.integer': 'Ticket ID must be an integer',
                    'number.positive': 'Ticket ID must be a positive number'
                }),
            reporter: Joi.number().integer().positive()
                .messages({
                    'number.base': 'Reporter ID must be a number',
                    'number.integer': 'Reporter ID must be an integer',
                    'number.positive': 'Reporter ID must be a positive number'
                }),
            assignee: Joi.number().integer().positive()
                .messages({
                    'number.base': 'Assignee ID must be a number',
                    'number.integer': 'Assignee ID must be an integer',
                    'number.positive': 'Assignee ID must be a positive number'
                }),
            status: Joi.string().valid(
                constants.ticketStatus.OPEN,
                constants.ticketStatus.IN_PROGRESS,
                constants.ticketStatus.CLOSED
            ).messages({
                'any.only': 'Invalid ticket status'
            }),
            priority: Joi.number().integer().min(1).max(5)
                .messages({
                    'number.base': 'Priority must be a number',
                    'number.integer': 'Priority must be an integer',
                    'number.min': 'Priority must be at least 1',
                    'number.max': 'Priority must be at most 5'
                }),
            limit: Joi.number().integer().positive()
                .messages({
                    'number.base': 'Limit must be a number',
                    'number.integer': 'Limit must be an integer',
                    'number.positive': 'Limit must be a positive number'
                }),
            offset: Joi.number().integer().min(0)
                .messages({
                    'number.base': 'Offset must be a number',
                    'number.integer': 'Offset must be an integer',
                    'number.min': 'Offset must be 0 or greater'
                })
        });

        const isValid = await validators.validateFields(
            apiReference,
            req,
            dataToValidate,
            res,
            schema
        );

        if (isValid) {
            logging.log(apiReference, { EVENT: 'FETCH_TICKETS_VALIDATION_SUCCESS' });
            next();
        }

    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'FETCH_TICKETS_VALIDATION_ERROR',
            user: req.user?.user_id
        });
        return validators.handleValidationError(res, err);
    }
};
