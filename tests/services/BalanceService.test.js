const sequelize = require("../../src/config/database");
const { User, Transaction } = require("../../src/models");
const BalanceService = require("../../src/services/BalanceService");

describe("BalanceService", () => {
  let user;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    user = await User.create({
      username: "john",
      withdrawableBalance: 100,
    });
  });

  describe("credit()", () => {
    test("should increase user balance", async () => {
      await BalanceService.credit({
        userId: user.id,
        amount: 50,
        type: "advance_credit",
        description: "Advance payout",
      });

      const updatedUser = await User.findByPk(user.id);

      expect(Number(updatedUser.withdrawableBalance)).toBe(150);
    });

    test("should create a transaction", async () => {
      await BalanceService.credit({
        userId: user.id,
        amount: 25,
        type: "advance_credit",
      });

      const transaction = await Transaction.findOne({
        where: { userId: user.id },
      });

      expect(transaction).not.toBeNull();
      expect(transaction.type).toBe("advance_credit");
      expect(Number(transaction.amount)).toBe(25);
    });

    test("should throw if user does not exist", async () => {
      await expect(
        BalanceService.credit({
          userId: "00000000-0000-0000-0000-000000000000",
          amount: 10,
          type: "advance_credit",
        })
      ).rejects.toThrow("User not found");
    });
  });

  describe("debit()", () => {
    test("should decrease user balance", async () => {
      await BalanceService.debit({
        userId: user.id,
        amount: 40,
        type: "withdrawal_debit",
      });

      const updatedUser = await User.findByPk(user.id);

      expect(Number(updatedUser.withdrawableBalance)).toBe(60);
    });

    test("should create a debit transaction", async () => {
      await BalanceService.debit({
        userId: user.id,
        amount: 20,
        type: "withdrawal_debit",
      });

      const transaction = await Transaction.findOne({
        where: { userId: user.id },
      });

      expect(transaction).not.toBeNull();
      expect(transaction.type).toBe("withdrawal_debit");
      expect(Number(transaction.amount)).toBe(20);
    });

    test("should throw if balance is insufficient", async () => {
      await expect(
        BalanceService.debit({
          userId: user.id,
          amount: 1000,
          type: "withdrawal_debit",
        })
      ).rejects.toThrow("Insufficient balance");
    });

    test("should throw if user does not exist", async () => {
      await expect(
        BalanceService.debit({
          userId: "00000000-0000-0000-0000-000000000000",
          amount: 10,
          type: "withdrawal_debit",
        })
      ).rejects.toThrow("User not found");
    });
  });
});