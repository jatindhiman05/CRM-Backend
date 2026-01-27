'use strict';

const responses = require('../responses/responses');
const constants = require('../responses/responseConstants');

exports.authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.user_type !== constants.userTypes.ADMIN) {
        return responses.failure(
            res,
            {},
            constants.responseMessages.UNAUTHORIZED_ACCESS
        );
    }

    console.log("It is admin here");
    next();
};
