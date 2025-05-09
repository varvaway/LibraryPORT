const express = require('express');
const router = express.Router();
const readerRequestController = require('../controllers/readerRequestController');

// GET запрос для получения всех заявок
router.get('/', (req, res) => {
  res.json({ message: 'Список заявок пока недоступен' });
});

// POST запрос для создания новой заявки
router.post('/', readerRequestController.sendReaderRequest);

module.exports = router;