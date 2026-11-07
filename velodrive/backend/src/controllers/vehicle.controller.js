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
}

module.exports = new VehicleController();