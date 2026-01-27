'use strict';

const Joi = require('joi');
const validators = require('../../../../validators/joiValidators');
const constants = require('../../../../responses/responseConstants');
const logging = require('../../../../logging/logging');

exports.login = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.AUTH.LOGIN,
        api: 'login'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'LOGIN_VALIDATION_START',
            email: req.body.email,
            ip: req.ip
        });

        const schema = Joi.object({
            email: Joi.string().email().required()
                .messages({
                    'string.email': 'Please provide a valid email address',
                    'any.required': 'Email is required'
                }),
            password: Joi.string().min(6).required()
                .messages({
                    'string.min': 'Password must be at least 6 characters',
                    'any.required': 'Password is required'
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
                EVENT: 'LOGIN_VALIDATION_SUCCESS'
            });
            next();
        }
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'LOGIN_VALIDATION_ERROR',
            email: req.body.email
        });
        return validators.handleValidationError(res, err);
    }
};