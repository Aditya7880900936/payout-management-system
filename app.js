const express = require("express");

const app = express();

app.use(express.json());

app.use("/api/test", require("./src/routes/test"));

module.exports = app;