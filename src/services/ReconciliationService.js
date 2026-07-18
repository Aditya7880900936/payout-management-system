const sequelize = require("../config/database");

const { Sale, User, Payout, Transaction } = require("../models");

const BalanceService = require("./BalanceService");

const { calculateRemaining } = require("../helpers/payoutCalculator");

class ReconciliationService {
  async reconcileSale(saleId, newStatus) {
    const dbTransaction = await sequelize.transaction();

    try {
      const sale = await Sale.findByPk(saleId, {
        transaction: dbTransaction,
      });

      if (!sale) throw new Error("Sale not found");

      if (sale.reconciled) throw new Error("Already reconciled");

      const user = await User.findByPk(sale.userId, {
        transaction: dbTransaction,
      });

      if (!user) {
        throw new Error("User not found");
      }

      const advance = Number(sale.advanceAmount);

      if (newStatus === "approved") {
        const remaining = calculateRemaining(Number(sale.earning), advance);

        await Payout.create(
          {
            userId: user.id,
            saleId: sale.id,
            type: "final",
            amount: remaining,
            status: "completed",
            remarks: "Final payout",
          },
          {
            transaction: dbTransaction,
          },
        );

        await BalanceService.credit({
          userId: user.id,
          amount: remaining,
          type: "final_credit",
          referenceId: sale.id,
          description: "Final payout",
          transaction: dbTransaction,
        });
      }

      if (newStatus === "rejected") {
        await BalanceService.debit({
          userId: user.id,
          amount: advance,
          type: "adjustment_debit",
          referenceId: sale.id,
          description: "Advance adjustment",
          transaction: dbTransaction,
        });
      }

      sale.status = newStatus;
      sale.reconciled = true;

      await sale.save({
        transaction: dbTransaction,
      });

      await user.save({
        transaction: dbTransaction,
      });

      await dbTransaction.commit();

      return sale;
    } catch (err) {
      await dbTransaction.rollback();

      throw err;
    }
  }
}

module.exports = new ReconciliationService();
