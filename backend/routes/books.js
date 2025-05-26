const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const auth = require('../middleware/auth');

// Получить все книги (публичный доступ)
router.get('/', booksController.getAllBooks);

// Получить все категории (публичный доступ)
router.get('/categories', booksController.getAllCategories);

// Получить книгу по ID (публичный доступ)
router.get('/:id', booksController.getBookById);

// Создать новую книгу (только админ)
router.post('/', auth.adminAuth, booksController.createBook);

// Обновить книгу (только админ)
router.put('/:id', auth.adminAuth, booksController.updateBook);

// Удалить книгу (только админ)
router.delete('/:id', auth.adminAuth, booksController.deleteBook);

// Забронировать книгу (только авторизованные пользователи)
router.post('/:id/reserve', auth.userAuth, booksController.reserveBook);

module.exports = router;
