const { Sale } = require("../models");

class SaleRepository {
    async getEligiblePendingSales(transaction = null) {
        return Sale.findAll({
            where: {
                status: "pending",
                advancePaid: false,
            },
            transaction,
        });
    }

    async updateSale(id, values, transaction = null) {
        return Sale.update(values, {
            where: { id },
            transaction,
        });
    }

    async findById(id, transaction = null) {
        return Sale.findByPk(id, {
            transaction,
        });
    }
}

module.exports = new SaleRepository();