const express = require('express');
const authController = require('../controllers/auth.controller');
const { redirectIfAuthenticated } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/login', redirectIfAuthenticated, authController.showLogin);
router.post('/login', redirectIfAuthenticated, authController.login);
router.get('/register', redirectIfAuthenticated, authController.showRegister);
router.post('/register', redirectIfAuthenticated, authController.register);
router.get('/forgot-password', redirectIfAuthenticated, authController.showForgotPassword);
router.post('/forgot-password', redirectIfAuthenticated, authController.resetPassword);
router.post('/logout', authController.logout);

module.exports = router;
