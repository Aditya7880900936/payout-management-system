const express = require("express");

const router = express.Router();

const runAdvancePayoutJob = require("../jobs/advancePayoutJob");

router.get("/advance-job", async (req, res) => {
  try {
    const result = await runAdvancePayoutJob();

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;