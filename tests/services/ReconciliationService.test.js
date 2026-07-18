const sequelize = require("../../src/config/database");
const { User, Sale, Payout, Transaction } = require("../../src/models");
const ReconciliationService = require("../../src/services/ReconciliationService");

describe("ReconciliationService", () => {
  let user;
  let sale;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    user = await User.create({
      username: "john",
      withdrawableBalance: 100,
    });

    sale = await Sale.create({
      userId: user.id,
      brand: "Nike",
      earning: 1000,
      status: "pending",
      reconciled: false,
      advancePaid: true,
      advanceAmount: 100,
    });
  });

  test("should reconcile approved sale", async () => {
    const result = await ReconciliationService.reconcileSale(
      sale.id,
      "approved",
    );

    expect(result.status).toBe("approved");
    expect(result.reconciled).toBe(true);

    const updatedUser = await User.findByPk(user.id);

    expect(Number(updatedUser.withdrawableBalance)).toBe(1000);

    const payout = await Payout.findOne({
      where: {
        saleId: sale.id,
        type: "final",
      },
    });

    expect(payout).not.toBeNull();

    const transaction = await Transaction.findOne({
      where: {
        type: "final_credit",
        referenceId: sale.id,
      },
    });

    expect(transaction).not.toBeNull();
  });

  test("should adjust advance when rejected", async () => {
    await ReconciliationService.reconcileSale(sale.id, "rejected");

    const updatedUser = await User.findByPk(user.id);

    expect(Number(updatedUser.withdrawableBalance)).toBe(0);

    const transaction = await Transaction.findOne({
      where: {
        type: "adjustment_debit",
      },
    });

    expect(transaction).not.toBeNull();
  });

  test("should throw if sale does not exist", async () => {
    await expect(
      ReconciliationService.reconcileSale(
        "00000000-0000-0000-0000-000000000000",
        "approved",
      ),
    ).rejects.toThrow("Sale not found");
  });

  test("should throw if already reconciled", async () => {
    await sale.update({
      reconciled: true,
    });

    await expect(
      ReconciliationService.reconcileSale(sale.id, "approved"),
    ).rejects.toThrow("Already reconciled");
  });

  test("should throw if user does not exist", async () => {
    await user.destroy();

    await expect(
      ReconciliationService.reconcileSale(sale.id, "approved"),
    ).rejects.toThrow("User not found");

    const payouts = await Payout.count();

    expect(payouts).toBe(0);
  });
});
