const AdvancePayoutService = require("../services/AdvancePayoutService");

async function runAdvancePayoutJob() {
  const result = await AdvancePayoutService.processAdvancePayouts();

  console.log(result);
}

module.exports = runAdvancePayoutJob;