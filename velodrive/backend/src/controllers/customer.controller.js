const userRepo = require('../repositories/user.repository');

class CustomerController {
  async getAll(req, res) {
    try {
      const customers = await userRepo.findAll();
      return res.json({ success: true, data: customers });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async toggleVerify(req, res) {
    try {
      const { id } = req.params;
      const { verified } = req.body;
      const updated = await userRepo.updateVerification(id, verified);
      return res.json({ success: true, data: updated });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CustomerController();