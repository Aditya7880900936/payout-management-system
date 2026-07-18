const AdvancePayoutService = require("../services/AdvancePayoutService");
const ReconciliationService = require("../services/ReconciliationService");
const { Sale } = require("../models");
const { User } = require("../models");
class PayoutController {
  async runAdvance(req, res, next) {
    try {
      const result = await AdvancePayoutService.processAdvancePayouts();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async reconcile(req, res, next) {
    try {
      const { saleId, status } = req.body;

      const result = await ReconciliationService.reconcileSale(
        saleId,
        status
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getSales(req, res) {
  const sales = await Sale.findAll();

  return res.json({
    success: true,
    data: sales,
  });
}

async getUsers(req, res) {
  const users = await User.findAll();

  res.json({
    success: true,
    data: users,
  });
}
}

module.exports = new PayoutController();