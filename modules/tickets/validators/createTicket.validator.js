'use strict';

const Joi = require('joi');
const validators = require('../../../validators/joiValidators');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.validate = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.TICKET.CREATE,
        api: 'createTicket'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'CREATE_TICKET_VALIDATION_START',
            user: req.user?.user_id,
            body: req.body
        });

        const schema = Joi.object({
            title: Joi.string().required().min(3).max(200)
                .messages({
                    'string.min': 'Title must be at least 3 characters',
                    'string.max': 'Title must be less than 200 characters',
                    'any.required': 'Title is required'
                }),
            description: Joi.string().required().min(10)
                .messages({
                    'string.min': 'Description must be at least 10 characters',
                    'any.required': 'Description is required'
                }),
            ticket_priority: Joi.number().min(1).max(5).default(4)
                .messages({
                    'number.min': 'Priority must be at least 1',
                    'number.max': 'Priority must be at most 5'
                })
        });

        const isValid = await validators.validateFields(
            apiReference,
            req,
            req.body,
            res,
            schema
        );

        if (isValid) {
            logging.log(apiReference, { EVENT: 'CREATE_TICKET_VALIDATION_SUCCESS' });
            next();
        }
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'CREATE_TICKET_VALIDATION_ERROR',
            user: req.user?.user_id
        });
        return validators.handleValidationError(res, err);
    }
};