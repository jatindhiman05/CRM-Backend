'use strict';

const Joi = require('joi');
const validators = require('../../../validators/joiValidators');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.validate = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.TICKET.GET_ONE,
        api: 'getTicketById'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_TICKET_VALIDATION_START',
            user: req.user?.user_id,
            params: req.params
        });

        const schema = Joi.object({
            ticket_id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'Ticket ID must be a number',
                    'number.integer': 'Ticket ID must be an integer',
                    'number.positive': 'Ticket ID must be positive',
                    'any.required': 'Ticket ID is required'
                })
        });

        const validationData = {
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
            logging.log(apiReference, { EVENT: 'GET_TICKET_VALIDATION_SUCCESS' });
            req.params.ticket_id = validationData.ticket_id;
            next();
        }
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_TICKET_VALIDATION_ERROR',
            user: req.user?.user_id,
            ticket_id: req.params.ticket_id
        });
        return validators.handleValidationError(res, err);
    }
};