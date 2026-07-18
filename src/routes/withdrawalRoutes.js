const router = require("express").Router();
const controller = require("../controllers/WithdrawalController");

router.post("/", controller.withdraw);

router.post("/recover", controller.recover);

module.exports = router;