const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authorsController');
const auth = require('../middleware/auth');

// Get all authors (public access)
router.get('/', authorsController.getAllAuthors);

// Get author by ID (public access)
router.get('/:id', authorsController.getAuthorById);

// Create a new author (admin only)
router.post('/', auth.adminAuth, authorsController.createAuthor);

// Update an author (admin only)
router.put('/:id', auth.adminAuth, authorsController.updateAuthor);

// Delete an author (admin only)
router.delete('/:id', auth.adminAuth, authorsController.deleteAuthor);

module.exports = router; 