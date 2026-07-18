const sequelize = require("../../src/config/database");
const { User, Withdrawal, Transaction } = require("../../src/models");
const WithdrawalService = require("../../src/services/WithdrawalService");

describe("WithdrawalService", () => {
  let user;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    user = await User.create({
      username: "john",
      withdrawableBalance: 200,
      lastWithdrawalAt: null,
    });
  });

  test("should create a withdrawal successfully", async () => {
    const withdrawal = await WithdrawalService.withdraw(user.id, 100);

    expect(withdrawal).toBeDefined();
    expect(withdrawal.status).toBe("processing");

    const updatedUser = await User.findByPk(user.id);

    expect(Number(updatedUser.withdrawableBalance)).toBe(100);
    expect(updatedUser.lastWithdrawalAt).not.toBeNull();

    const transaction = await Transaction.findOne({
      where: {
        referenceId: withdrawal.id,
      },
    });

    expect(transaction).not.toBeNull();
    expect(transaction.type).toBe("withdrawal_debit");
  });

  test("should throw if user does not exist", async () => {
    await expect(
      WithdrawalService.withdraw(
        "00000000-0000-0000-0000-000000000000",
        100
      )
    ).rejects.toThrow("User not found");
  });

  test("should throw when balance is insufficient", async () => {
    await expect(
      WithdrawalService.withdraw(user.id, 500)
    ).rejects.toThrow("Insufficient balance");
  });

  test("should allow only one withdrawal every 24 hours", async () => {
    await WithdrawalService.withdraw(user.id, 50);

    await expect(
      WithdrawalService.withdraw(user.id, 20)
    ).rejects.toThrow("Only one withdrawal allowed every 24 hours");
  });

  test("should rollback on failure", async () => {
    try {
      await WithdrawalService.withdraw(user.id, 500);
    } catch {}

    const withdrawals = await Withdrawal.findAll();

    expect(withdrawals.length).toBe(0);

    const updatedUser = await User.findByPk(user.id);

    expect(Number(updatedUser.withdrawableBalance)).toBe(200);
  });
});