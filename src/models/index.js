const User = require("./User");
const Sale = require("./Sale");
const Payout = require("./Payout");
const Withdrawal = require("./Withdrawal");
const Transaction = require("./Transaction");

/*
    User
*/

User.hasMany(Sale);
Sale.belongsTo(User);

User.hasMany(Payout);
Payout.belongsTo(User);

User.hasMany(Withdrawal);
Withdrawal.belongsTo(User);

User.hasMany(Transaction);
Transaction.belongsTo(User);

/*
    Sale
*/

Sale.hasMany(Payout);
Payout.belongsTo(Sale);

module.exports = {
    User,
    Sale,
    Payout,
    Withdrawal,
    Transaction
};