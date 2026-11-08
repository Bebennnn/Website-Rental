const bookingRepo = require("../repositories/booking.repository");
const bookingService = require("../services/booking.service");

class BookingController {
  async getAll(req, res) {
    try {
      const bookings = await bookingRepo.findAll();
      return res.json({ success: true, data: bookings });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const created = await bookingService.createBooking({
        ...req.body,
        userId: req.user.id,
      });

      return res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async cancel(req, res) {
    try {
      const { code } = req.params;

      const updated = await bookingService.cancelBooking(code, req.user.id);

      return res.json({
        success: true,
        data: updated,
        message: "Booking berhasil dibatalkan.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updatePayment(req, res) {
    try {
      const updated = await bookingService.updatePayment(
        req.params.code,
        req.body.paidAmount,
      );
      return res.json({
        success: true,
        data: updated,
        message: "Pembayaran berhasil diperbarui.",
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { code } = req.params;
      const { status } = req.body;
      const updated = await bookingService.updateBookingStatus(code, status);
      return res.json({ success: true, data: updated });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BookingController();
