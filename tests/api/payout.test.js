const request = require("supertest");
const app = require("../../app");
const sequelize = require("../../src/config/database");
const { User, Sale } = require("../../src/models");

describe("Payout API", () => {
  let user;
  let sale;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    user = await User.create({
      username: "john",
      withdrawableBalance: 0,
    });

    sale = await Sale.create({
      userId: user.id,
      brand: "brand_1",
      earning: 100,
      status: "pending",
    });
  });

  test("GET /api/payouts/sales", async () => {
    const res = await request(app).get("/api/payouts/sales");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  test("POST /api/payouts/advance/run", async () => {
    const res = await request(app)
      .post("/api/payouts/advance/run")
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/payouts/reconcile", async () => {
    const res = await request(app)
      .post("/api/payouts/reconcile")
      .send({
        saleId: sale.id,
        status: "approved",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});