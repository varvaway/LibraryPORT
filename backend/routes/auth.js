const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { userAuth } = require('../middleware/auth');

// Публичные маршруты
router.post('/login', authController.login);
router.post('/register', authController.register);

// Защищенные маршруты (требуют авторизации)
router.get('/profile', userAuth, authController.profile);
router.put('/profile', userAuth, authController.updateProfile);

module.exports = router;
module.exports = router;