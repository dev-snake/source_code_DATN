const express = require("express");
const router = express.Router();

const VoucherController = require("@/controllers/VoucherController");
const { staffTokenMiddleware, customerTokenMiddleware } = require("@/middlewares/token-middlewares");
const { validateRequiredParams } = require("@/middlewares/required-params");
const { validateForbiddenParams } = require("@/middlewares/forbidden-params");
const { validateOptionalParams } = require("@/middlewares/optional-params");
const { requiredRole } = require("@/middlewares/role-validate");

router.get("/", VoucherController.getAllVouchers);
router.post(
	"/",
	staffTokenMiddleware,
	validateRequiredParams(["voucherCode", "discountValue", "validFrom", "validTo", "type"]),
	requiredRole(1),
	VoucherController.createNewVoucher
);

router.post("/check",
	customerTokenMiddleware,
	validateRequiredParams([
		"voucherCode",
		"orderData"
	]),
	VoucherController.checkUsabilityForOrder
);


router.patch("/:voucherId/delete", staffTokenMiddleware, VoucherController.softDeleteVoucher);
router.patch("/:voucherId/recover", staffTokenMiddleware, VoucherController.recoverVoucher)

router.get("/:voucherId", VoucherController.getVoucherInfo);
router.patch(
	"/:voucherId",
	staffTokenMiddleware,
	validateOptionalParams([
		"voucherCode",
		"voucherDescription",
		"branchId",
		"whiteListUsers",
		"discountValue",
		"maxValue",
		"maxTotalUsage",
		"maxUserUsage",
		"validFrom",
		"validTo",
		"minimumOrderValues",
		"type",
		"isWhiteList",
	]),
	validateForbiddenParams(["usedCount", "userUsed", "creatorId", "_id"]),
	requiredRole(1),
	VoucherController.updateVoucher
);
router.patch("/:voucherId/used", customerTokenMiddleware, VoucherController.increaseUsedCount);
router.delete("/:voucherId", staffTokenMiddleware, requiredRole(1), VoucherController.hardDeleteVoucher);

module.exports = router;
