const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/books', bookController.getBooks);
router.get('/books/:id', bookController.getBookById);

// Admin only routes
router.post('/books', authMiddleware, adminMiddleware, bookController.createBook);
router.put('/books/:id', authMiddleware, adminMiddleware, bookController.updateBook);
router.delete('/books/:id', authMiddleware, adminMiddleware, bookController.deleteBook);

module.exports = router;