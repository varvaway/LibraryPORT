const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bookingsController = require('../controllers/bookingsController');

router.get('/reader', auth.userAuth, bookingsController.getReaderBookings);

module.exports = router;
