const User = require("./User");
const Sale = require("./Sale");
const Payout = require("./Payout");
const Withdrawal = require("./Withdrawal");
const Transaction = require("./Transaction");

/* User ↔ Sale */
User.hasMany(Sale, {
  foreignKey: "userId",
});
Sale.belongsTo(User, {
  foreignKey: "userId",
});

/* User ↔ Payout */
User.hasMany(Payout, {
  foreignKey: "userId",
});
Payout.belongsTo(User, {
  foreignKey: "userId",
});

/* User ↔ Withdrawal */
User.hasMany(Withdrawal, {
  foreignKey: "userId",
});
Withdrawal.belongsTo(User, {
  foreignKey: "userId",
});

/* User ↔ Transaction */
User.hasMany(Transaction, {
  foreignKey: "userId",
});
Transaction.belongsTo(User, {
  foreignKey: "userId",
});

/* Sale ↔ Payout */
Sale.hasMany(Payout, {
  foreignKey: "saleId",
});
Payout.belongsTo(Sale, {
  foreignKey: "saleId",
});

/* Payout ↔ Transaction */
Payout.hasMany(Transaction, {
  foreignKey: "payoutId",
});
Transaction.belongsTo(Payout, {
  foreignKey: "payoutId",
});

module.exports = {
  User,
  Sale,
  Payout,
  Withdrawal,
  Transaction,
};