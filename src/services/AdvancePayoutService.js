const sequelize = require("../config/database");
const { User, Sale, Payout, Transaction } = require("../models");
const BalanceService = require("./BalanceService");
const { calculateAdvance } = require("../helpers/payoutCalculator");

class AdvancePayoutService {
  async processAdvancePayouts() {
    const dbTransaction = await sequelize.transaction();

    try {
      const pendingSales = await Sale.findAll({
        where: {
          status: "pending",
          advancePaid: false,
        },
        transaction: dbTransaction,
      });

      for (const sale of pendingSales) {
        const advanceAmount = calculateAdvance(Number(sale.earning));

        const user = await User.findByPk(sale.userId, {
          transaction: dbTransaction,
        });

        if (!user) continue;

        await Payout.create(
          {
            userId: user.id,
            saleId: sale.id,
            type: "advance",
            amount: advanceAmount,
            status: "completed",
            remarks: "10% advance payout",
          },
          { transaction: dbTransaction },
        );

        await BalanceService.credit({
          userId: user.id,
          amount: advanceAmount,
          type: "advance_credit",
          referenceId: sale.id,
          description: "Advance payout credited",
          transaction: dbTransaction,
        });

        sale.advancePaid = true;
        sale.advanceAmount = advanceAmount;

        await sale.save({
          transaction: dbTransaction,
        });
      }

      await dbTransaction.commit();

      return {
        success: true,
        processed: pendingSales.length,
      };
    } catch (err) {
      await dbTransaction.rollback();
      throw err;
    }
  }
}

module.exports = new AdvancePayoutService();
