const { User } = require("../models");

class UserRepository {
    async findById(id, transaction = null) {
        return User.findByPk(id, {
            transaction,
        });
    }

    async update(id, values, transaction = null) {
        return User.update(values, {
            where: { id },
            transaction,
        });
    }
}

module.exports = new UserRepository();