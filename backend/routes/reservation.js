const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Authenticated user routes
router.post('/', authMiddleware, reservationController.createReservation);
router.get('/my', authMiddleware, reservationController.getMyReservations);
router.post('/:id/cancel', authMiddleware, reservationController.cancelReservation);

// Admin only routes
router.get('/', authMiddleware, adminMiddleware, reservationController.getAllReservations);
router.post('/:id/complete', authMiddleware, adminMiddleware, reservationController.completeReservation);

module.exports = router;