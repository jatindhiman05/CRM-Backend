'use strict';

const Joi = require('joi');
const validators = require('../../../validators/joiValidators');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.validate = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.TICKET.UPDATE,
        api: 'updateTicket'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'UPDATE_TICKET_VALIDATION_START',
            user: req.user?.user_id,
            params: req.params,
            body: req.body
        });

        const schema = Joi.object({
            ticket_id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'Ticket ID must be a number',
                    'number.integer': 'Ticket ID must be an integer',
                    'number.positive': 'Ticket ID must be positive',
                    'any.required': 'Ticket ID is required'
                }),
            title: Joi.string().min(3).max(200).optional()
                .messages({
                    'string.min': 'Title must be at least 3 characters',
                    'string.max': 'Title must be less than 200 characters'
                }),
            description: Joi.string().min(10).optional()
                .messages({
                    'string.min': 'Description must be at least 10 characters'
                }),
            status: Joi.string()
                .valid('OPEN', 'IN_PROGRESS', 'BLOCKED', 'CLOSED')
                .optional()
                .uppercase()
                .messages({
                    'any.only': 'Status must be one of: OPEN, IN_PROGRESS, BLOCKED, CLOSED'
                }),
            ticket_priority: Joi.number().min(1).max(5).optional()
                .messages({
                    'number.min': 'Priority must be at least 1',
                    'number.max': 'Priority must be at most 5'
                })
        });

        const validationData = {
            ...req.body,
            ticket_id: parseInt(req.params.ticket_id)
        };

        const isValid = await validators.validateFields(
            apiReference,
            req,
            validationData,
            res,
            schema
        );

        if (isValid) {
            logging.log(apiReference, { EVENT: 'UPDATE_TICKET_VALIDATION_SUCCESS' });
            req.body = validationData;
            req.params.ticket_id = validationData.ticket_id;
            next();
        }
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'UPDATE_TICKET_VALIDATION_ERROR',
            user: req.user?.user_id,
            ticket_id: req.params.ticket_id
        });
        return validators.handleValidationError(res, err);
    }
};