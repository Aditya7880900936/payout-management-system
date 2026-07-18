const { Payout } = require("../models");

class PayoutRepository {
    async create(data, transaction = null) {
        return Payout.create(data, {
            transaction,
        });
    }
}

module.exports = new PayoutRepository();