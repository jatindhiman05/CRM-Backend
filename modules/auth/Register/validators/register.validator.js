'use strict';

const Joi = require('joi');
const validators = require('../../../../validators/joiValidators');
const constants = require('../../../../responses/responseConstants');
const logging = require('../../../../logging/logging');

exports.register = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.AUTH.REGISTER,
        api: 'register'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'REGISTER_VALIDATION_START',
            email: req.body.email,
            ip: req.ip
        });

        const schema = Joi.object({
            name: Joi.string().min(2).max(100).required()
                .messages({
                    'string.min': 'Name must be at least 2 characters',
                    'string.max': 'Name must be less than 100 characters',
                    'any.required': 'Name is required'
                }),
            email: Joi.string().email().min(10).max(100).required()
                .messages({
                    'string.email': 'Please provide a valid email address',
                    'string.min': 'Email must be at least 10 characters',
                    'string.max': 'Email must be less than 100 characters',
                    'any.required': 'Email is required'
                }),
            password: Joi.string().min(7).max(100).required()
                .messages({
                    'string.min': 'Password must be at least 7 characters',
                    'string.max': 'Password must be less than 100 characters',
                    'any.required': 'Password is required'
                }),
            user_type: Joi.string()
                .valid(constants.userTypes.CUSTOMER, constants.userTypes.ENGINEER, constants.userTypes.ADMIN)
                .default(constants.userTypes.CUSTOMER)
                .messages({
                    'any.only': 'User type must be one of: CUSTOMER, ENGINEER, ADMIN'
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
            logging.log(apiReference, {
                EVENT: 'REGISTER_VALIDATION_SUCCESS'
            });
            next();
        }
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'REGISTER_VALIDATION_ERROR',
            email: req.body.email
        });
        return validators.handleValidationError(res, err);
    }
};