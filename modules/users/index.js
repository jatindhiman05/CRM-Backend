'use strict';

const router = require('express').Router();

const { authenticateUser } = require('../../middlewares/authenticateUser');
const { authorizeAdmin } = require('../../middlewares/authorizeAdmin');

const fetchUsersController = require('./controllers/fetchUsers.controller');
const updateUserController = require('./controllers/updateUser.controller');

const fetchUsersValidator = require('./validators/fetchUsers.validator');
const updateUserValidator = require('./validators/updateUser.validator');

router.get(
    '/',
    authenticateUser,
    authorizeAdmin,
    fetchUsersValidator.validate,
    fetchUsersController.fetchUsers
);

router.get(
    '/:user_id',
    authenticateUser,
    authorizeAdmin,
    fetchUsersValidator.validate,
    fetchUsersController.fetchUsers
);

router.put(
    '/:user_id',
    authenticateUser,
    authorizeAdmin,
    updateUserValidator.validate,
    updateUserController.updateUser
);

module.exports = router;
