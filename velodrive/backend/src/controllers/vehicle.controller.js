const vehicleRepo = require('../repositories/vehicle.repository');

class VehicleController {
  async getAll(req, res) {
    try {
      const vehicles = await vehicleRepo.findAll();
      return res.json({ success: true, data: vehicles });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const created = await vehicleRepo.create(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await vehicleRepo.updateStatus(id, status);
      return res.json({ success: true, data: updated });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateImage(req, res) {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      const updated = await vehicleRepo.updateImage(id, imageUrl);
      return res.json({ success: true, data: updated });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateServiceSchedule(req, res) {
    try {
      const { id } = req.params;
      const { currentKm, nextServiceKm, nextServiceDate } = req.body;
      const isValidKm = (value) =>
        value === null || (Number.isInteger(value) && value >= 0);

      if (!isValidKm(currentKm) || !isValidKm(nextServiceKm)) {
        return res.status(400).json({
          success: false,
          message: 'Kilometer harus berupa bilangan bulat nol atau lebih, atau null.',
        });
      }

      if (
        nextServiceDate !== null &&
        (typeof nextServiceDate !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(nextServiceDate) ||
          Number.isNaN(Date.parse(`${nextServiceDate}T00:00:00Z`)))
      ) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal servis harus berupa tanggal valid atau null.',
        });
      }

      const updated = await vehicleRepo.updateServiceSchedule(id, {
        currentKm,
        nextServiceKm,
        nextServiceDate,
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });
      }
      return res.json({ success: true, data: updated });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new VehicleController();