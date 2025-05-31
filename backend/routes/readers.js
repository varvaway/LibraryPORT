const express = require('express');
const router = express.Router();
const { getReaders, getReaderDetails, updateReader, deleteReader, createReader } = require('../controllers/readerController');
const { adminAuth } = require('../middleware/auth');

// Получить список всех читателей (только для админа)
router.get('/', adminAuth, getReaders);

// Создать нового читателя (публичный доступ)
router.post('/', createReader);

// Получить детальную информацию о читателе (только для админа)
router.get('/:id', adminAuth, getReaderDetails);

// Обновить информацию о читателе (только для админа)
router.put('/:id', adminAuth, updateReader);

// Удалить читателя (только для админа)
router.delete('/:id', adminAuth, deleteReader);

module.exports = router;
