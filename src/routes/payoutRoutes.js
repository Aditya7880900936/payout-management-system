const router = require("express").Router();
const controller = require("../controllers/PayoutController");

router.post("/advance/run", controller.runAdvance);

router.post("/reconcile", controller.reconcile);

module.exports = router;