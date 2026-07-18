const { User, Transaction } = require("../models");

class BalanceService {
  async credit({
    userId,
    amount,
    type,
    referenceId = null,
    payoutId = null,
    description = "",
    transaction,
  }) {
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      throw new Error("User not found");
    }

    user.withdrawableBalance =
      Number(user.withdrawableBalance) + Number(amount);

    await user.save({ transaction });

    await Transaction.create(
      {
        userId,
        payoutId,
        type,
        amount,
        referenceId,
        description,
      },
      { transaction }
    );

    return user;
  }

  async debit({
    userId,
    amount,
    type,
    referenceId = null,
    payoutId = null,
    description = "",
    transaction,
  }) {
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      throw new Error("User not found");
    }

    if (Number(user.withdrawableBalance) < Number(amount)) {
      throw new Error("Insufficient balance");
    }

    user.withdrawableBalance =
      Number(user.withdrawableBalance) - Number(amount);

    await user.save({ transaction });

    await Transaction.create(
      {
        userId,
        payoutId,
        type,
        amount,
        referenceId,
        description,
      },
      { transaction }
    );

    return user;
  }
}

module.exports = new BalanceService();