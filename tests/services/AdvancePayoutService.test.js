const sequelize = require("../../src/config/database");
const { User, Sale, Payout, Transaction } = require("../../src/models");
const AdvancePayoutService = require("../../src/services/AdvancePayoutService");

describe("AdvancePayoutService", () => {
  let user;
  let sale;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    user = await User.create({
      username: "john",
      withdrawableBalance: 0,
    });

    sale = await Sale.create({
      userId: user.id,
      brand: "Nike",
      earning: 1000,
      status: "pending",
      advancePaid: false,
    });
  });

  test("should process advance payout", async () => {
    const result = await AdvancePayoutService.processAdvancePayouts();

    expect(result.success).toBe(true);
    expect(result.processed).toBe(1);

    const updatedSale = await Sale.findByPk(sale.id);
    expect(updatedSale.advancePaid).toBe(true);
    expect(Number(updatedSale.advanceAmount)).toBe(100);

    const updatedUser = await User.findByPk(user.id);
    expect(Number(updatedUser.withdrawableBalance)).toBe(100);

    const payout = await Payout.findOne({
      where: {
        saleId: sale.id,
        type: "advance",
      },
    });

    expect(payout).not.toBeNull();

    const transaction = await Transaction.findOne({
      where: {
        referenceId: sale.id,
        type: "advance_credit",
      },
    });

    expect(transaction).not.toBeNull();
  });

  test("should return zero processed when no pending sales exist", async () => {
    await sale.update({
      advancePaid: true,
    });

    const result = await AdvancePayoutService.processAdvancePayouts();

    expect(result.success).toBe(true);
    expect(result.processed).toBe(0);

    const payouts = await Payout.count();

    expect(payouts).toBe(0);
  });

  test("should ignore already processed sales", async () => {
    await sale.update({
      advancePaid: true,
    });

    const result = await AdvancePayoutService.processAdvancePayouts();

    expect(result.processed).toBe(0);
  });
});
