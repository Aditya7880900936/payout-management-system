const sequelize = require("../config/database");

const {
    Sale,
    User,
    Payout,
    Transaction,
} = require("../models");

const {
    calculateRemaining,
} = require("../helpers/payoutCalculator");

class ReconciliationService {

    async reconcileSale(saleId, newStatus) {

        const dbTransaction =
            await sequelize.transaction();

        try {

            const sale =
                await Sale.findByPk(saleId, {
                    transaction: dbTransaction,
                });

            if (!sale)
                throw new Error("Sale not found");

            if (sale.reconciled)
                throw new Error("Already reconciled");

            const user =
                await User.findByPk(
                    sale.UserId,
                    {
                        transaction: dbTransaction,
                    }
                );

            const advance =
                Number(sale.advanceAmount);

            if (newStatus === "approved") {

                const remaining =
                    calculateRemaining(
                        Number(sale.earning),
                        advance
                    );

                await Payout.create(
                    {
                        userId: user.id,
                        saleId: sale.id,
                        type: "final",
                        amount: remaining,
                        status: "completed",
                        remarks:
                            "Finaldone  payout",
                    },
                    {
                        transaction: dbTransaction,
                    }
                );

                await Transaction.create(
                    {
                        userId: user.id,
                        type: "final_credit",
                        amount: remaining,
                        referenceId: sale.id,
                    },
                    {
                        transaction: dbTransaction,
                    }
                );

                user.withdrawableBalance =
                    Number(
                        user.withdrawableBalance
                    ) + remaining;
            }

            if (newStatus === "rejected") {

                await Transaction.create(
                    {
                        userId: user.id,
                        type: "adjustment_debit",
                        amount: advance,
                        referenceId: sale.id,
                        description:
                            "Advance adjusted",
                    },
                    {
                        transaction: dbTransaction,
                    }
                );

                user.withdrawableBalance =
                    Math.max(
                        0,
                        Number(
                            user.withdrawableBalance
                        ) - advance
                    );
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

module.exports =
    new ReconciliationService();