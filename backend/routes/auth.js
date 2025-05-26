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

//sqlcmd -S MISS\SQLEXPRESS03\LibraryDB –E
//sqlcmd -S MISS\SQLEXPRESS03 –U library_user –P StrongPassword123!
module.exports = router;