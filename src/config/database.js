const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage:
    process.env.NODE_ENV === "test" ? "./test.sqlite" : process.env.DB_STORAGE,
  logging: false,
});

module.exports = sequelize;
