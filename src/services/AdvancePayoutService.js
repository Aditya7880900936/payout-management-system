const sequelize = require("../config/database");

const SaleRepository = require("../repositories/SaleRepository");
const UserRepository = require("../repositories/UserRepository");
const PayoutRepository = require("../repositories/PayoutRepository");

class AdvancePayoutService {
    async run() {

        const transaction = await sequelize.transaction();

        try {

            const sales =
                await SaleRepository.getEligiblePendingSales(transaction);

            for (const sale of sales) {

                const advance =
                    Number(sale.earning) * 0.10;

                await PayoutRepository.create(
                    {
                        userId: sale.UserId,
                        saleId: sale.id,

                        type: "advance",

                        amount: advance,

                        status: "completed",

                        remarks: "Advance payout",
                    },
                    transaction
                );

                const user =
                    await UserRepository.findById(
                        sale.UserId,
                        transaction
                    );

                await UserRepository.update(
                    sale.UserId,
                    {
                        withdrawableBalance:
                            Number(user.withdrawableBalance) +
                            advance,
                    },
                    transaction
                );

                await SaleRepository.updateSale(
                    sale.id,
                    {
                        advancePaid: true,
                        advanceAmount: advance,
                    },
                    transaction
                );
            }

            await transaction.commit();

            return sales.length;

        } catch (err) {

            await transaction.rollback();

            throw err;
        }
    }
}

module.exports = new AdvancePayoutService();