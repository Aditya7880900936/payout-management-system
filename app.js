const express = require("express");

const payoutRoutes = require("./src/routes/payoutRoutes");
const withdrawalRoutes = require("./src/routes/withdrawalRoutes");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

app.use(express.json());

app.use("/api/payouts", payoutRoutes);
app.use("/api/withdrawals", withdrawalRoutes);

app.use(errorHandler);

module.exports = app;