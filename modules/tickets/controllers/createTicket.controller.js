'use strict';

const service = require('../services/createTicket.service');
const responses = require('../../../responses/responses');
const logging = require('../../../logging/logging');
const constants = require('../../../responses/responseConstants');

exports.createTicket = async (req, res, next) => {
    const apiReference = {
        module: constants.modules.TICKET.CREATE,
        api: 'createTicket'
    };

    try {
        logging.log(apiReference, {
            EVENT: 'CREATE_TICKET_REQUEST',
            user: req.user.user_id,
            user_type: req.user.user_type,
            body: req.body
        });

        const response = await service.createTicket(
            apiReference,
            req.user,
            req.body
        );

        logging.log(apiReference, {
            EVENT: 'CREATE_TICKET_RESPONSE',
            success: response.success,
            ticket_id: response.data?.ticket_id,
            assignee: response.data?.assignee
        });

        if (response.success) {
            return responses.success(
                res,
                response.data,
                constants.responseMessages.TICKET_CREATED
            );
        }

        return responses.failure(res, {}, response.error);
    } catch (err) {
        logging.logError(apiReference, err, {
            EVENT: 'CREATE_TICKET_ERROR',
            user: req.user.user_id,
            body: req.body
        });
        return next(err);
    }
};