const router = require("express").Router();
const controller = require("../controllers/PayoutController");

const validate = require("../middleware/validate");

const reconcileValidator = require("../validators/reconcileValidator");

router.post("/advance/run", controller.runAdvance);

router.post(
    "/reconcile",
    validate(reconcileValidator),
    controller.reconcile
);

module.exports = router;