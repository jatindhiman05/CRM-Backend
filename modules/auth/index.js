'use strict';

const registerController = require('./Register/controllers/register.controller');
const registerValidator = require('./Register/validators/register.validator');

const loginController = require('./Login/controllers/login.controller');
const loginValidator = require('./Login/validators/login.validator');

const router = require('express').Router();

// Register route
router.post(
    '/register',
    registerValidator.register,
    registerController.register
);

// Login route
router.post(
    '/login',
    loginValidator.login,
    loginController.login
);

module.exports = router;