const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    type: {
      type: DataTypes.ENUM(
        "advance_credit",
        "final_credit",
        "withdrawal_debit",
        "recovery_credit",
        "adjustment_debit"
      ),
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
  }
);

module.exports = Transaction;