const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Withdrawal = sequelize.define(
  "Withdrawal",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "rejected"
      ),
      defaultValue: "pending",
    },
  },
  {
    tableName: "withdrawals",
    timestamps: true,
  }
);

module.exports = Withdrawal;