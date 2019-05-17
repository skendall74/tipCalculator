const router = require("express").Router();
const smsRoutes = require("./twilio.js")

router.use("/api", smsRoutes);

module.exports = router;