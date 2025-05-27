const express = require('express');
const router = express.Router();
const { getReaders, getReaderDetails } = require('../controllers/readerController');
const { adminAuth } = require('../middleware/auth');

// Получить список всех читателей (только для админа)
router.get('/', adminAuth, getReaders);

// Получить детальную информацию о читателе (только для админа)
router.get('/:id', adminAuth, getReaderDetails);

module.exports = router;
