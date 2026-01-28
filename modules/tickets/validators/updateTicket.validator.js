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
            title: Joi.string().min(3).max(200).optional(),
            description: Joi.string().min(10).optional(),
            status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'BLOCKED', 'CLOSED').optional().uppercase(),
            ticket_priority: Joi.number().min(1).max(5).optional(),
            before_ticket_id: Joi.number().integer().positive().optional(),
            after_ticket_id: Joi.number().integer().positive().optional()
        });

        const validationData = {
            ...req.body,
            ticket_id: parseInt(req.params.ticket_id),
            before_ticket_id: req.params.before_ticket_id ? parseInt(req.params.before_ticket_id) : undefined,
            after_ticket_id: req.params.after_ticket_id ? parseInt(req.params.after_ticket_id) : undefined
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
            next();
        }
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'UPDATE_TICKET_VALIDATION_ERROR',
            user: req.user?.user_id
        });
        return validators.handleValidationError(res, err);
    }
};
