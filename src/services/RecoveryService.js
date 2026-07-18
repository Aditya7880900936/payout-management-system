const sequelize = require("../config/database");

const { Withdrawal, User, Transaction } = require("../models");

class RecoveryService {
  async recover(withdrawalId, status) {
    const dbTransaction = await sequelize.transaction();

    try {
      const withdrawal = await Withdrawal.findByPk(withdrawalId, {
        transaction: dbTransaction,
      });

      if (!withdrawal) throw new Error("Withdrawal not found");

      if (!["failed", "cancelled", "rejected"].includes(status)) {
        throw new Error("Invalid status");
      }

      if (withdrawal.status !== "processing") {
        throw new Error("Recovery already handled");
      }

      withdrawal.status = status;

      await withdrawal.save({
        transaction: dbTransaction,
      });

      const user = await User.findByPk(withdrawal.userId, {
        transaction: dbTransaction,
      });

      await BalanceService.credit({
        userId: user.id,
        amount: withdrawal.amount,
        type: "recovery_credit",
        referenceId: withdrawal.id,
        description: "Recovered failed withdrawal",
        transaction: dbTransaction,
      });

      await dbTransaction.commit();

      return withdrawal;
    } catch (err) {
      await dbTransaction.rollback();
      throw err;
    }
  }
}

module.exports = new RecoveryService();
