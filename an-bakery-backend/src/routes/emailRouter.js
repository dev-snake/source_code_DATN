const express = require("express");
const router = express.Router();

const EmailController = require("@/services/EmailService");
const { customerTokenMiddleware } = require("@/middlewares/token-middlewares");

router.post("/send-otp", customerTokenMiddleware, EmailController.sendMailChangePassword);

module.exports = router;