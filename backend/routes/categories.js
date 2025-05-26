const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

// Получить все категории (публичный доступ)
router.get('/', booksController.getAllCategories);

module.exports = router;
