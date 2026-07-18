const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payout = sequelize.define(
  "Payout",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    type: {
      type: DataTypes.ENUM("advance", "final", "recovery"),
      allowNull: false,
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

    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "payouts",
    timestamps: true,
  }
);

module.exports = Payout;