const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const vehicleController = require('../controllers/vehicle.controller');
const bookingController = require('../controllers/booking.controller');
const customerController = require('../controllers/customer.controller');

// Auth User Routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

// Vehicle Fleet Routes
router.get('/vehicles', vehicleController.getAll);
router.post('/vehicles', vehicleController.create);
router.patch('/vehicles/:id/status', vehicleController.updateStatus);
router.patch('/vehicles/:id/image', vehicleController.updateImage);

// Booking Routes
router.get('/bookings', bookingController.getAll);
router.post('/bookings', bookingController.create);
router.patch('/bookings/:code/status', bookingController.updateStatus);

// Admin Customer Inspection Routes
router.get('/customers', customerController.getAll);
router.patch('/customers/:id/verify', customerController.toggleVerify);

module.exports = router;