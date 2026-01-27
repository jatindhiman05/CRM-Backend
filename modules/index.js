const router  = require("express").Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/tickets", require("./tickets"));

module.exports = router;