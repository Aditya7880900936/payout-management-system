const WithdrawalService = require("../services/WithdrawalService");
const RecoveryService = require("../services/RecoveryService");

class WithdrawalController {
  async withdraw(req, res, next) {
    try {
      const { userId, amount } = req.body;

      const result = await WithdrawalService.withdraw(
        userId,
        amount
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async recover(req, res, next) {
    try {
      const { withdrawalId, status } = req.body;

      const result = await RecoveryService.recover(
        withdrawalId,
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

module.exports = new WithdrawalController();