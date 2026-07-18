const sequelize = require("../../src/config/database");
const { User, Withdrawal, Transaction } = require("../../src/models");
const RecoveryService = require("../../src/services/RecoveryService");

describe("RecoveryService", () => {
  let user;
  let withdrawal;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    user = await User.create({
      username: "john",
      withdrawableBalance: 100,
    });

    // Simulate a withdrawal that already deducted balance
    user.withdrawableBalance = 50;
    await user.save();

    withdrawal = await Withdrawal.create({
      userId: user.id,
      amount: 50,
      status: "processing",
    });
  });

  test("should recover a failed withdrawal", async () => {
    const result = await RecoveryService.recover(
      withdrawal.id,
      "failed"
    );

    expect(result.status).toBe("failed");

    const updatedUser = await User.findByPk(user.id);
    expect(Number(updatedUser.withdrawableBalance)).toBe(100);

    const transaction = await Transaction.findOne({
      where: {
        referenceId: withdrawal.id,
      },
    });

    expect(transaction).not.toBeNull();
    expect(transaction.type).toBe("recovery_credit");
  });

  test("should throw when withdrawal does not exist", async () => {
    await expect(
      RecoveryService.recover(
        "00000000-0000-0000-0000-000000000000",
        "failed"
      )
    ).rejects.toThrow("Withdrawal not found");
  });

  test("should throw for invalid status", async () => {
    await expect(
      RecoveryService.recover(
        withdrawal.id,
        "processing"
      )
    ).rejects.toThrow("Invalid status");
  });

  test("should not recover twice", async () => {
    await RecoveryService.recover(
      withdrawal.id,
      "failed"
    );

    await expect(
      RecoveryService.recover(
        withdrawal.id,
        "failed"
      )
    ).rejects.toThrow("Recovery already handled");
  });

  test("should rollback on failure", async () => {
    try {
      await RecoveryService.recover(
        "00000000-0000-0000-0000-000000000000",
        "failed"
      );
    } catch {}

    const updatedUser = await User.findByPk(user.id);

    // Balance should remain unchanged
    expect(Number(updatedUser.withdrawableBalance)).toBe(50);

    // No recovery transaction should exist
    const transactions = await Transaction.findAll({
      where: {
        type: "recovery_credit",
      },
    });

    expect(transactions.length).toBe(0);
  });
});