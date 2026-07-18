const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sale = sequelize.define(
  "Sale",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    earning: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected"
      ),
      defaultValue: "pending",
    },

    advancePaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    advanceAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    reconciled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "sales",
    timestamps: true,
  }
);

module.exports = Sale;