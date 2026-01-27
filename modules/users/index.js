'use strict';

const router = require('express').Router();

const { authenticateUser } = require('../../middlewares/authenticateUser');
const { authorizeAdmin } = require('../../middlewares/authorizeAdmin');

/* controllers */
const getAllUsersController = require('./controllers/getAllUsers.controller');
const getUserByIdController = require('./controllers/getUserById.controller');
const updateUserController = require('./controllers/updateUser.controller');

/* validators */
const getUserValidator = require('./validators/getUser.validator');
const updateUserValidator = require('./validators/updateUser.validator');

// Get all users


// validator, logic inside the service 
// make dao dynamic
router.get(
    '/',
    authenticateUser,
    authorizeAdmin,
    getAllUsersController.getAllUsers
);

// Get user by ID
router.get(
    '/:user_id',
    authenticateUser,
    authorizeAdmin,
    getUserValidator.validate,
    getUserByIdController.getUserById
);

// Update user
router.put(
    '/:user_id',
    authenticateUser,
    authorizeAdmin,
    updateUserValidator.validate,
    updateUserController.updateUser
);

module.exports = router;