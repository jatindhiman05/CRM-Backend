const logging = require('../logging/logging');
const responses = require('../responses/responses');
const constants = require('../responses/responseConstants');

const joiValidate = async (apiReference, body, schema, res) => {
    logging.log(apiReference, { EVENT: 'VALIDATE_FIELDS', BODY: body });

    try {
        await schema.validateAsync(body, { abortEarly: true });
        return true;
    } catch (error) {
        logging.logError(apiReference, error);

        return responses.failure(
            res,
            {},
            error.details?.[0]?.message || constants.responseMessages.MISSING_PARAMETER
        );
    }
};

const validateFields = async (apiReference, req, body, res, schema) => {
    return joiValidate(apiReference, body, schema, res);
};

module.exports = { validateFields };
