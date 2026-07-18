const request = require("supertest");
const app = require("../../app");
const sequelize = require("../../src/config/database");
const { User } = require("../../src/models");
const BalanceService = require("../../src/services/BalanceService");

describe("Withdrawal API", () => {
  let user;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    user = await User.create({
      username: "john",
      withdrawableBalance: 0,
    });

    await BalanceService.credit({
      userId: user.id,
      amount: 100,
      type: "test_credit",
      description: "Test Balance",
    });
  });

  test("POST /api/withdrawals", async () => {
    const res = await request(app).post("/api/withdrawals").send({
      userId: user.id,
      amount: 20,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/withdrawals/recover", async () => {
    const withdrawal = await request(app).post("/api/withdrawals").send({
      userId: user.id,
      amount: 20,
    });

    const withdrawalId = withdrawal.body.data.id;

    const res = await request(app).post("/api/withdrawals/recover").send({
      withdrawalId,
      status: "failed",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
