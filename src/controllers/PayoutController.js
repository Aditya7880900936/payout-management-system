const AdvancePayoutService = require("../services/AdvancePayoutService");
const ReconciliationService = require("../services/ReconciliationService");

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
}

module.exports = new PayoutController();