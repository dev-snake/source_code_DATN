const express = require("express");
const router = express.Router();

const AuthController = require("@/controllers/AuthController");
const {
	customerTokenMiddleware,
	refreshTokenMiddleware,
} = require("@/middlewares/token-middlewares");
const { validateRequiredParams } = require("@/middlewares/required-params");

router.post(
	"/sign-up",
	validateRequiredParams(["email", "password", "provider"]),
	AuthController.signUp
);
router.post(
	"/sign-in",
	validateRequiredParams(["email", "password", "provider"]),
	AuthController.signIn
);
router.get("/sign-out", customerTokenMiddleware, AuthController.signOut);
router.get("/rftk", refreshTokenMiddleware, AuthController.refreshToken);
router.post(
	"/request-recover",
	validateRequiredParams(["email"]),
	AuthController.requestRecoverAccount
);
router.post(
	"/recover",
	validateRequiredParams(["email", "otpCode"]),
	AuthController.recoverAccount
);

module.exports = router;
