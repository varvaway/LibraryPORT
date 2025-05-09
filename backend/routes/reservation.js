const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Authenticated user routes
router.post('/reservations', authMiddleware, reservationController.createReservation);
router.get('/reservations/my', authMiddleware, reservationController.getMyReservations);
router.post('/reservations/:id/cancel', authMiddleware, reservationController.cancelReservation);

// Admin only routes
router.get('/reservations', authMiddleware, adminMiddleware, reservationController.getAllReservations);
router.post('/reservations/:id/complete', authMiddleware, adminMiddleware, reservationController.completeReservation);

module.exports = router;