const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth.middleware");

const authController = require("../controllers/auth.controller");
const vehicleController = require("../controllers/vehicle.controller");
const bookingController = require("../controllers/booking.controller");
const customerController = require("../controllers/customer.controller");

// AUTH USER ROUTES
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);

// VEHICLE FLEET ROUTES
router.get("/vehicles", vehicleController.getAll);
router.post("/vehicles", vehicleController.create);
router.patch("/vehicles/:id/status", vehicleController.updateStatus);
router.patch("/vehicles/:id/image", vehicleController.updateImage);
router.patch(
  "/vehicles/:id/service-schedule",
  vehicleController.updateServiceSchedule
);

// BOOKING ROUTES
router.get(
  "/bookings",
  authenticate,
  authorize("ADMIN"),
  bookingController.getAll
);

router.post(
  "/bookings",
  authenticate,
  authorize("USER"),
  bookingController.create
);

router.patch(
  "/bookings/:code/status",
  authenticate,
  authorize("ADMIN"),
  bookingController.updateStatus
);

router.patch(
  "/bookings/:code/cancel",
  authenticate,
  authorize("USER"),
  bookingController.cancel
);

router.patch(
  "/bookings/:code/payment",
  authenticate,
  authorize("ADMIN"),
  bookingController.updatePayment
);

// ADMIN CUSTOMER ROUTES
router.get(
  "/customers",
  authenticate,
  authorize("ADMIN"),
  customerController.getAll
);

router.patch(
  "/customers/:id/verify",
  authenticate,
  authorize("ADMIN"),
  customerController.toggleVerify
);

router.patch(
  "/customers/:id/account-status",
  authenticate,
  authorize("ADMIN"),
  customerController.updateAccountStatus
);

// CUSTOMER STATUS CHECK
router.get("/customers/:id/status", customerController.checkStatus);

module.exports = router;