'use strict';

const Joi = require('joi');
const validators = require('../../../validators/joiValidators');
const constants = require('../../../responses/responseConstants');
const logging = require('../../../logging/logging');

exports.validate = async (req, res, next) => {
    const apiReference = {
        module: 'user',
        api: 'updateUser'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'UPDATE_USER_VALIDATION_START',
            params: req.params,
            body: req.body
        });

        const schema = Joi.object({
            user_id: Joi.string().trim().pattern(/^[A-Z]{3}_[a-f0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Invalid user ID format'
                }),
            user_type: Joi.string()
                .valid('CUSTOMER', 'ENGINEER', 'ADMIN')
                .optional()
                .uppercase(),
            user_status: Joi.string()
                .valid('PENDING', 'APPROVED', 'REJECTED', 'INACTIVE')
                .optional()
                .uppercase()
        }).or('user_type', 'user_status') // At least one update field required
            .messages({
                'object.missing': 'At least one of user_type or user_status is required for update'
            });

        const validationData = {
            ...req.body,
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
            logging.log(apiReference, { EVENT: 'UPDATE_USER_VALIDATION_SUCCESS' });
            req.body = validationData;
            next();
        }
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'UPDATE_USER_VALIDATION_ERROR',
            user_id: req.params.user_id
        });
        return validators.handleValidationError(res, err);
    }
};