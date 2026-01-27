'use strict';

const Joi = require('joi');
const validators = require('../../../validators/joiValidators');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.validate = async (req, res, next) => {
    const apiReference = {
        module: 'user',
        api: 'getUserById'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'GET_USER_VALIDATION_START',
            params: req.params
        });

        const schema = Joi.object({
            user_id: Joi.string().trim().pattern(/^[A-Z]{3}_[a-f0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Invalid user ID format. Expected format: PREFIX_RANDOM (e.g., CUS_a1b2c3d4)'
                })
        });

        const validationData = {
            user_id: req.params.user_id
        };

        const isValid = await validators.validateFields(
            apiReference,
            req,
            validationData,
            res,
            schema
        );

        if (isValid) {
            logging.log(apiReference, { EVENT: 'GET_USER_VALIDATION_SUCCESS' });
            req.body = validationData;
            next();
        }
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'GET_USER_VALIDATION_ERROR',
            user_id: req.params.user_id
        });
        return validators.handleValidationError(res, err);
    }
};