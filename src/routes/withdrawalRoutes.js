const router = require("express").Router();
const controller = require("../controllers/WithdrawalController");


const validate = require("../middleware/validate");

const withdrawalValidator = require("../validators/withdrawalValidator");
const recoveryValidator = require("../validators/recoveryValidator");

router.post(
    "/",
    validate(withdrawalValidator),
    controller.withdraw
);

router.post(
    "/recovery",
    validate(recoveryValidator),
    controller.recover
);

module.exports = router;