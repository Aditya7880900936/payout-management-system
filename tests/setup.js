const sequelize = require("../src/config/database");
require("../src/models");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});