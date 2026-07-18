const sequelize = require("../config/database");
const { User, Withdrawal, Transaction } = require("../models");
const BalanceService = require("./BalanceService");

class WithdrawalService {
  async withdraw(userId, amount) {
    const dbTransaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, {
        transaction: dbTransaction,
      });

      if (!user) {
        throw new Error("User not found");
      }

      const now = new Date();

      if (user.lastWithdrawalAt) {
        const last = new Date(user.lastWithdrawalAt);

        const hours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

        if (hours < 24) {
          throw new Error("Only one withdrawal allowed every 24 hours");
        }
      }

      if (Number(user.withdrawableBalance) < Number(amount)) {
        throw new Error("Insufficient balance");
      }

      const withdrawal = await Withdrawal.create(
        {
          userId,
          amount,
          status: "processing",
        },
        {
          transaction: dbTransaction,
        },
      );

      await BalanceService.debit({
        userId,
        amount,
        type: "withdrawal_debit",
        referenceId: withdrawal.id,
        description: "Withdrawal initiated",
        transaction: dbTransaction,
      });

      user.lastWithdrawalAt = now;

      await user.save({
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

module.exports = new WithdrawalService();
